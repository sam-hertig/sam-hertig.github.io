document.addEventListener('DOMContentLoaded', function () {
    if (detectWebGLContext()) {
        create3DMenu(document.getElementById("portfoliomenu"));    
    } else {
        redirect2NonWebGl();
    }
});


function detectWebGLContext () {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return (gl && gl instanceof WebGLRenderingContext);
}


function redirect2NonWebGl() {
    window.location.replace('home.html');
}


function create3DMenu(container) {

    var camera, scene, renderer;
    var camAngle = -5;
    var hoverTime = 1000, animTime = 2000, animTimeShort = 4;
    var ambLight, dirLight, camLight;
    var mouse = new THREE.Vector2(), intersectedObject, raycaster, menuObjects, selectedObj;
    var zoomState = {
        zoomedOut : 0,
        zoomingIn : 1,
        zoomedIn : 2,
        zoomingOut : 3,
        photoSwipe : 4
    };
    
    var paper, film, molecules;

    var highlightedLink;
    var graphicsLink = document.getElementById('graphicslink');
    var videosLink = document.getElementById('videoslink');
    var interactiveLink = document.getElementById('interactivelink');
    var homeLink = document.getElementById('homelink');
    var aboutLink = document.getElementById('aboutlink');    
    
    var popupDiv = document.getElementById("popup");
    var footerDiv = document.getElementById("footer");
    var messageDiv = document.getElementById("message");
    var toolTipDiv = document.getElementById("tooltip");
    var popW = popupDiv.offsetWidth;
    var popH = popupDiv.offsetHeight;
    var mouseMoveTimer;

    function getDim() {
        var dim = {
            width : container.offsetWidth
        };                    
        dim.height = dim.width * (1/2);
        return dim;
    }

    init();
    animate();


    function init() {

        // get initial dimensions
        var dim = getDim();
        
        // initial scaling of popup div
        popupDiv.style.width = (popW*dim.width/960).toString() + "px";
        popupDiv.style.minHeight = (popH*dim.width/960).toString() + "px";
        popupDiv.style.margin = (-(popH/2)*dim.width/960).toString() + "px 0 0 " + (-(popW/2)*dim.width/960).toString() + "px";

        // scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 100, 1000);

        // camera
        camera = new THREE.PerspectiveCamera(32, dim.width/dim.height, 1, 200);
        camera.up.set(0,0,1);
        camera.position.set(10, 60, 50); 
        camera.lookAt(new THREE.Vector3(0, 0, camAngle)); 
        scene.add(camera);

        // disable shadows on devices with lower resolution
        var w = screen.width>screen.height ? screen.width : screen.height;
        var h = screen.width>screen.height ? screen.height : screen.width;
        var enableShadows = (w >= 1280 && h >= 750) ? true : false;

        // lights
        ambLight = new THREE.AmbientLight( 0xffffff, 0.8 );
        scene.add(ambLight); 
        dirLight = new THREE.DirectionalLight( 0xffffff, 0.9 ); 
        dirLight.position.set( -20, 30, 40 );
        dirLight.castShadow = enableShadows;
        dirLight.shadow.mapSize.width = 512;
        dirLight.shadow.mapSize.height = 512;
        var d = 40;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.bias = -0.002;
        scene.add(dirLight);
        camLight = dirLight.clone();
        camLight.castShadow = false;
        camLight.intensity = 0.2;
        camera.add(camLight);

        // surface
        var groundMaterial = new THREE.MeshLambertMaterial( {color: scene.fog.color} );
        var surfMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), groundMaterial );     
        surfMesh.receiveShadow = true;
        scene.add(surfMesh);

        // container object for selectable menu objects
        menuObjects = new THREE.Object3D();
        scene.add(menuObjects);
    
        // paper scroll
        paper = createPaperScroll(menuObjects, popupDiv);
        paper.visible = false;
        menuObjects.add(paper);
        
        // film spool
        film = createFilmSpool(popupDiv);
        film.visible = false;
        menuObjects.add(film);

        // molecules
        molecules = createMolecules(menuObjects, popupDiv);
        molecules.visible = false;
        menuObjects.add(molecules);               
                      
        // set up raycaster
        raycaster = new THREE.Raycaster();

        // set up renderer
        renderer = new THREE.WebGLRenderer( {antialias: false} ); //false gives better performance; true looks better
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(dim.width, dim.height);
        renderer.setClearColor(scene.fog.color);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // listen to window resizing and mouse moves/clicks
        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('click', onMouseClick, false);              

        // listen to browser back button clicks and zoom out if zoomed in
        window.addEventListener('hashchange', function() {
            locationHashChanged(animTime);
        }, false);

        // listen to link hovers
        graphicsLink.addEventListener('mouseover', linkOver, false);
        graphicsLink.addEventListener('mouseout', linkOut, false);
        videosLink.addEventListener('mouseover', linkOver, false);
        videosLink.addEventListener('mouseout', linkOut, false);
        interactiveLink.addEventListener('mouseover', linkOver, false);
        interactiveLink.addEventListener('mouseout', linkOut, false);               

        // once page is loaded, reveal menu items and check for hashed url:
        window.onload = function() {  
            // unhide all menu items
            paper.visible = true;
            film.visible = true;
            molecules.visible = true;
            // unhide footer div
            footerDiv.style.opacity = 1;
            messageDiv.style.opacity = 1;
            // check hash location and modfiy location quickly if needed
            locationHashChanged(animTimeShort);
        }

    }   

    function locationHashChanged(time) {     
        var target = (window.location.href.split('#'))[1];
        if (target && target!='' && (state === zoomState.zoomedIn || state === zoomState.zoomedOut)) {
            var i, newTargetObject;
            for (i=0; i<menuObjects.children.length; i++) {
                if (menuObjects.children[i].urlName === target) {
                    newTargetObject = menuObjects.children[i];
                    break;
                }
            }
            if (newTargetObject != selectedObj) {
                if (selectedObj) {
                    selectedObj.animate(-time)
                }
                selectedObj = newTargetObject;
                moveCamera(selectedObj, time);
                selectedObj.animate(time);
            }    
        } else if (selectedObj && state === zoomState.zoomedIn) {
            moveCamera(null, time);
            selectedObj.animate(-time);
            selectedObj = null;
        }                
    }

    function linkOver(event) {
        if (state === zoomState.zoomedOut) {
            var curObj;
            switch(event.target.id) {
                case 'graphicslink' : 
                    curObj = paper;
                    break;
                case 'videoslink' : 
                    curObj = film;
                    break;
                case 'interactivelink' :
                    curObj = molecules;
            }
            curObj.hover(hoverTime);
        }
        if (state === zoomState.zoomedOut || state === zoomState.zoomedIn) { 
            event.target.style.color = '#95987d';
        }    
    }


    function linkOut(event) {
        if (state === zoomState.zoomedOut) {
            var curObj;
            switch(event.target.id) {
                case 'graphicslink' : 
                    curObj = paper;
                    break;
                case 'videoslink' : 
                    curObj = film;
                    break;
                case 'interactivelink' :
                    curObj = molecules;
            }
            curObj.hover(-hoverTime);
        }
        event.target.style.color = '#000000';
    }


    function onWindowResize() {
        var dim = getDim();
        camera.aspect = dim.width/dim.height;
        camera.updateProjectionMatrix();
        renderer.setSize(dim.width, dim.height);
        popupDiv.style.width = (popW*dim.width/960).toString() + "px";
        popupDiv.style.minHeight = (popH*dim.width/960).toString() + "px";
        popupDiv.style.margin = (-(popH/2)*dim.width/960).toString() + "px 0 0 " + (-(popW/2)*dim.width/960).toString() + "px";       
    }


    function onMouseMove(event) {
        event.preventDefault();
        // get cursor positions
        var dim= getDim();
        var viewportOffset = container.getBoundingClientRect();
        var top = viewportOffset.top;
        var left = viewportOffset.left;
        mouse.x = ( (event.clientX-left) / dim.width ) * 2 - 1;
        mouse.y = - ( (event.clientY-top) / dim.height ) * 2 + 1;
        // find intersections
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(menuObjects.children, true);
        if (intersects.length > 0) {

            if (intersectedObject != intersects[0].object) {
                // un-highlight old object and link
                if (intersectedObject) {
                    if (state === zoomState.zoomedOut) {
                        intersectedObject.parent.hover(-hoverTime);
                    }    
                    highlightedLink.style.color = '#000000';
                } 
                // assign new object
                intersectedObject = intersects[0].object;
                // check whether we are too deep inside the object tree (texture of paper!)
                if (intersectedObject.parent.parent.parent.parent != null) {
                    intersectedObject = intersectedObject.parent;
                }
                // find new link
                switch (intersectedObject.parent.urlName) {
                    case 'graphics' :
                        highlightedLink = graphicsLink;
                        break;
                    case 'videos' :
                        highlightedLink = videosLink;
                        break;
                    case 'interactive' :
                        highlightedLink = interactiveLink;
                }
                // if it's the same object as before, return              
                if (selectedObj && selectedObj === intersectedObject.parent) {
                    return;
                } else {
                    container.style.cursor = 'pointer';
                }
                if (state === zoomState.zoomedOut) {
                    intersectedObject.parent.hover(hoverTime);
                }    
                // highlight new link
                highlightedLink.style.color = '#95987d';
            }

        } else {
            // un-highlight old object and link
            if (intersectedObject) {
                if (state === zoomState.zoomedOut) {
                    intersectedObject.parent.hover(-hoverTime);
                }    
                highlightedLink.style.color = '#000000';
            }
            intersectedObject = null;
            highlightedLink = null;
            container.style.cursor = 'auto';
        }

        // tooltip
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(function() {
            if (intersectedObject && state === zoomState.zoomedOut) {
                var content = intersectedObject.parent.urlName;

                toolTipDiv.innerHTML = content[0].toUpperCase() + content.substring(1);

                toolTipDiv.style.display = 'inline';
                toolTipDiv.style.left = (event.clientX-left+20) + 'px';
                toolTipDiv.style.top = (event.clientY-top+20) + 'px';                  
            } else {
                toolTipDiv.style.display = 'none';
            }
        }, 200);
        toolTipDiv.style.display = 'none';        

    }

    function onMouseClick(event) {
        if (intersectedObject && (state === zoomState.zoomedIn || state === zoomState.zoomedOut)) {
            if (intersectedObject.parent != selectedObj) { 
                if (selectedObj) {
                    selectedObj.animate(-animTime)
                }
                selectedObj = intersectedObject.parent;
                moveCamera(selectedObj, animTime);
                selectedObj.animate(animTime);
                highlightedLink.style.color = '#000000';               
                window.location.href='#' + selectedObj.urlName; // add history entry to enable back-button; window.location.hash='' doesn't work wioth webkit
            }   
        } else if (state === zoomState.zoomedIn) {
            moveCamera(null, animTime);
            selectedObj.animate(-animTime);
            selectedObj = null;
            window.location.href='#';
        }
    }


    function moveCamera(menuObj, t) {

        var currentParams = {
            camX : camera.position.x,
            camY : camera.position.y,
            camZ : camera.position.z,
            lookAtZ : state === zoomState.zoomedOut ? camAngle : 9.5,
        };
        var targetParams;

        if (menuObj) {
            if (state === zoomState.zoomedIn) {
                blendPopupDiv(null, t/4);
            }
            state = zoomState.zoomingIn;       
            var bb = new THREE.Box3()
            bb.setFromObject(menuObj);
            var centerPos = bb.center();
            var zoomedPos = (centerPos.normalize()).multiplyScalar(60);
            targetParams = {
                camX : zoomedPos.x,
                camY : zoomedPos.y,
                camZ : 9.5,
                lookAtZ : 9.5
            };
        } else {
            state = zoomState.zoomingOut;
            var timer = -0.0001 * (Date.now()+t); 
            targetParams = {
                camX : Math.cos(timer) * 65, 
                camY : Math.sin(timer) * 65, 
                camZ : 50,
                lookAtZ: camAngle             
            };
            blendPopupDiv(null, t/4);             
        }    

        var cameraTween = new TWEEN.Tween(currentParams).to(targetParams, t);
        cameraTween.onUpdate(function() {
            camera.up.set(0,0,1);
            camera.position.set(currentParams.camX,currentParams.camY,currentParams.camZ);
            camera.lookAt(new THREE.Vector3(0,0,currentParams.lookAtZ));      
        });
        cameraTween.easing(TWEEN.Easing.Exponential.InOut);
        cameraTween.start();
        cameraTween.onComplete(function() {
            state = (state === zoomState.zoomingIn) ? zoomState.zoomedIn : zoomState.zoomedOut;
            if (state === zoomState.zoomedIn) {
                blendPopupDiv(menuObj, t/2);
            } else if (state === zoomState.zoomedOut) {
                window.location.href='#';
            }
        });

    }


    function blendPopupDiv(menuObj, t) {
        var currentParams = {opa: menuObj ? 0 : 1};
        var targetParams = {opa: 1 - currentParams.opa};
        var divTween = new TWEEN.Tween(currentParams).to(targetParams, t);
        divTween.onUpdate(function() {
            popupDiv.style.opacity = currentParams.opa;
            messageDiv.style.opacity = 1 - currentParams.opa;
            footerDiv.style.opacity = 1 - currentParams.opa;
        });

        if (menuObj) {
            state = zoomState.zoomingIn;
            window.location.href='#'+menuObj.urlName;
            divTween.onComplete(function() {
                state = zoomState.zoomedIn;
                window.location.href='#'+menuObj.urlName;
            });            
            divTween.easing(TWEEN.Easing.Cubic.In);
            var lang = (document.URL.indexOf('DE')>-1) ? 'de' : 'en';
            popupDiv.innerHTML = menuObj.getHtmlContent(lang);
            clickables = document.getElementsByClassName("preventzoomout");
            for (var i = 0; i < clickables.length; i++) {
                clickables[i].onmouseover = function() {
                    state = zoomState.zoomingIn;
                };
                clickables[i].onmouseout = function() {
                    state = zoomState.zoomedIn;
                };                    
            }

        } else {
            divTween.onComplete(function() {
                popupDiv.innerHTML = '';
            });
        }
        divTween.start();
    }


    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        renderer.render(scene, camera);
    }


}


