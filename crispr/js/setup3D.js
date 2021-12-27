function setup3D(module) {

    // Scene 
    var scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0xffffff, 0.002); //0.001
    if (!debug) {
        scene.fog = new THREE.Fog(0xffffff, 250, 300);    
    }
    
    // Renderer
    // var renderer = new THREE.WebGLRenderer({antialias: true});
    var renderer = new THREE.WebGLRenderer();
    // renderer.setClearColor(scene.fog.color);
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    var container = document.getElementById('webgl-container');
    container.appendChild(renderer.domElement);

    // Camera
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000 ); //50000  
    camera.position.set(10, 10, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    var cameraUp = new THREE.Vector3(0, 0, 1);
    camera.up.copy(cameraUp);
    scene.add(camera);

    // Lights   
    var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);
    var camLight = new THREE.PointLight(0xffffff, 0.4);
    camLight.position.copy(camera.position); 
    camera.add(camLight);
    
    // Camera Controls
    var controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.zoomSpeed = 0.5;
    controls.maxDistance = 1000; //handled by transitions
    controls.noPan = debug ? false : true;      
    
    // Resize
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Clock
    var clock = new THREE.Clock(true);  

    // Stats
    if (debug) {
        var stats = new Stats();
        container.appendChild(stats.dom);        
    }

    // Helper Box with transform controls:
    if (debug) {
        var boxGeom = new THREE.BoxGeometry(5, 5, 5);
        var boxMat = new THREE.MeshLambertMaterial({color: 0xFF0000});
        var boxMesh = new THREE.Mesh(boxGeom, boxMat);
        scene.add(boxMesh);
        var control = new THREE.TransformControls(camera, renderer.domElement);
        control.attach(boxMesh);
        scene.add(control);    
        module.box = boxMesh;
        window.addEventListener( 'keydown', function ( event ) {
            switch ( event.keyCode ) {
                case 81: // Q
                    control.setSpace( control.space === "local" ? "world" : "local" );
                    break;
                case 17: // Ctrl
                    control.setTranslationSnap( 100 );
                    control.setRotationSnap( THREE.Math.degToRad( 15 ) );
                    break;
                case 87: // W
                    control.setMode( "translate" );
                    break;
                case 69: // E
                    control.setMode( "rotate" );
                    break;
                case 82: // R
                    control.setMode( "scale" );
                    break;
                case 187:
                case 107: // +, =, num+
                    control.setSize( control.size + 0.1 );
                    break;
                case 189:
                case 109: // -, _, num-
                    control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                    break;
            }
        });
        window.addEventListener( 'keyup', function ( event ) {
            switch ( event.keyCode ) {
                case 17: // Ctrl
                    control.setTranslationSnap( null );
                    control.setRotationSnap( null );
                    break;
            }
        });              
    }    

    // Helper function for creating white sprites that can mask unwanted spots
    module.createFogCaps = function(vertices, size, file) {
        file = file || "textures/fogCap.png";
        var spriteMap = new THREE.TextureLoader().load(file);
        var spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            // depthTest: false,
            fog: false,
            rotation: 0,                
        });
        var caps = new THREE.Object3D();
        vertices.forEach(function(v) {
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(v);
            sprite.scale.set(size, size, size);
            caps.add(sprite);
        });
        return caps;
    }

    // Create mask for nucleus:
    var nucleusMask = module.createFogCaps([new THREE.Vector3(0,0,10000)], 50000);
    scene.add(nucleusMask);
    module.nucleusMask = nucleusMask;
  
    // Loading manager
    var storyBox = document.getElementById("storytext");
    var nrOfItems = 18;
    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        // console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        storyBox.innerHTML = "Visualization loading... ("+Math.round(100*itemsLoaded/nrOfItems)+"%)"
        if (itemsLoaded === nrOfItems) {
            setTimeout(function () {
                storyBox.innerHTML = module.storyBoxContents[0];   
            }, 0); //200
        }
    };

    // Add properties to module:
    module.clock = clock;
    module.scene = scene; 
    module.renderer = renderer;
    module.camera = camera;
    module.cameraUp = cameraUp;
    module.controls = controls;
    module.stats = stats;
    module.storyBoxContents = [];

    // Main 3D objects:
    module.cas9 = new THREE.Object3D();
    module.rna = new THREE.Object3D();
    module.cas9Confs = {};    
    module.dna = new THREE.Object3D();
    module.naParts = {};

    // Methods
    module.animateNucleus = function () {};
    module.animateBubbles = function () {};
    module.animateBgSprites = function () {};
    module.brownianMotion = function () {};

    module.scene.visible = false;

    return module;

}