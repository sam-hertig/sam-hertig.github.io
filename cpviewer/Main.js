// initialize renderer to the first entry of the menu
createRenderer("cpviewer/hiv_env.dae", "off", function(dae) {
  // our callback function...
  $('div#tree').html('<ul id="tree">'+createList(dae)+'</ul>'); // injects the tree-list as html
  createOutlines(); // creates extra geometries that will prdocue outlines when highlighted
  createDummyItem(dae); // fixes a bug where shadows appear when the last visible object is highlighted
  $('ul#tree').bonsai(); // converts the list to a dynamic tree using bonsai.js
  mouse(); // mouse hover and click effects
})


// event handler for file selection and shadow toggling
$(function() {    
  $("#filenames").selectmenu({      
      change: function( event, data ) {
        $("div#tree").empty();
        $("#3dwindow").empty();
        createRenderer(data.item.value, $("#shadows").val(), function(dae) {
          // our callback function...
          $('div#tree').html('<ul id="tree">'+createList(dae)+'</ul>'); // injects the tree-list as html
          createOutlines(); // creates extra geometries that will prdocue outlines when highlighted
          createDummyItem(dae); // fixes a bug where shadows appear when the last visible object is highlighted
          $('ul#tree').bonsai(); // converts the list to a dynamic tree using bonsai.js
          mouse(); // mouse hover and click effects
        })
      }     
  });
  $("#shadows").selectmenu({      
      change: function( event, data ) {
        $("div#tree").empty();
        $("#3dwindow").empty();
        createRenderer($("#filenames").val(), data.item.value, function(dae) {
          // our callback function...
          $('div#tree').html('<ul id="tree">'+createList(dae)+'</ul>'); // injects the tree-list as html
          createOutlines(); // creates extra geometries that will prdocue outlines when highlighted
          createDummyItem(dae); // fixes a bug where shadows appear when the last visible object is highlighted
          $('ul#tree').bonsai(); // converts the list to a dynamic tree using bonsai.js
          mouse(); // mouse hover and click effects
        })
      }     
  });
}); 

// global variables:  
var id = 0;
var scenes = new Array();

// creates a hierarchical list of the collada objects
function createList(scene) {
  id += 1;
  var html='';
  var c = scene.children;
  if (scene.name == '' && c.length <= 1) {
    if (c.length == 1) {
      html = createList(c[0]);
    }
  }
  else if (c.length == 0) {
    html+='<li data-sceneid='+id+'>'+scene.name+'</li>';
    scenes[id]=scene;  
  }
  else {
    if (scene.name == '') {
      scene.name = 'All' // just a placeholder...
    }
    html+='<li data-sceneid='+id+'>'+scene.name+'<ul>';
    scenes[id]=scene;
    for (var i=0; i<c.length; i++) {
      html+=createList(c[i]);
    }
    html += '</ul>';
  }
  return html;
}


// mouse click and hover effects:
function mouse() {
  // toggle visibilities on mouseclick: 
  $('ul.bonsai li').dblclick(function(e) {
    e.stopPropagation();
    var id = $(this).prop('id');
    var sceneid = $(this).data('sceneid');
    scenes[sceneid].visible = !scenes[sceneid].visible;
    if(scenes[sceneid].visible) {
      $("#"+id).css("color", "black");
    }
    else {
      $("#"+id).css("color", "grey"); 
    }
  });
  // hover toggles highlight color:
  // mouseenter/mouseleave don't work well here!
  $('ul.bonsai li').mouseover(function(e){
    e.stopPropagation();  
    var id = $(this).prop('id');
    $("#"+id).css("color", "red");
    var sceneid = $("#"+id).data('sceneid');
    highlight(scenes[sceneid], -8);
  });
  $('ul.bonsai li').mouseout(function(e){
    e.stopPropagation();  
    var id = $(this).prop('id');
    var sceneid = $("#"+id).data('sceneid');
    if(scenes[sceneid].visible) {
      $("#"+id).css("color", "black");
    }
    else {
      $("#"+id).css("color", "grey"); 
    }
    highlight(scenes[sceneid], 0);
  });
}

// highlights or de-highlights the scene and all its children
function highlight(scene, value) {
  var c = scene.children;
  for (var i=0; i<c.length; i++) {
    if (c[i].hasOwnProperty('material') && c[i].children.length > 0 && c[i].children[0].outlineThing == true) {
      c[i].children[0].material.polygonOffsetFactor = value;
      if (value != 0) {
        c[i].children[0].visible = true;
      }
      else {
        c[i].children[0].visible = false;
      }
    }
    highlight(c[i], value);
  }   
} 

// creates duplicates for all meshes to be used as outlines, hidden by default
function createOutlines() {
  for (var i in scenes) {
    var c = scenes[i].children;
    for (var j in c) {
      if (c[j].type == "Mesh") {
        var outlineGeometry = c[j].geometry;
        var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000, side: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: 0 } );
        var outlineMesh = new THREE.Mesh( outlineGeometry, outlineMaterial );
        outlineMesh.outlineThing = true;
        outlineMesh.visible = false;
        c[j].add(outlineMesh);
      }
    }  
  }  
}


// creates an extra mesh that serves as a hack to prevent meshes from getting dark when outlining the last object in the tree
function createDummyItem(scene) {
  var dummyGeometry = new THREE.SphereGeometry( 0.001, 1, 1 );
  var dummyMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000, transparent: true, opacity: 0} );
  var dummyMesh = new THREE.Mesh( dummyGeometry, dummyMaterial );
  scene.add(dummyMesh); // add a tiny fully transparent low-resolution sphere...
};


// converts all object3ds to cast and receive shadows
function enableShadows(scene) {
  scene.castShadow = true;
  scene.receiveShadow = true;
  for (key in scene.children) {
    enableShadows(scene.children[key]);
  }
}

// main function that creates the 3d-viewer and imports a collada-file, shadows is a boolean
function createRenderer(filename, shadows, callback) {

  var scene, camera, renderer, controls;
  
  if (shadows == 'off') {
    shadows = false;
  }
  else if (shadows == 'on') {
    shadows = true;
  }

  init(filename); // initialization & main function
  animate(); // redraw the scene when rotating the camera:

  // main function that creates the WebGL renderer
  function init(filename) {
    // create scene:
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xeeeeee, 0.0006 );
    var WIDTH = document.getElementById("3dwindow").parentElement.clientWidth;
    var HEIGHT = WIDTH/2;
    //var WIDTH = 600, HEIGHT = 300;
    // create renderer:
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    //renderer.setClearColor(0x333333, 1)
    renderer.setClearColor( scene.fog.color );
    // to create shadows:
    renderer.shadowMapEnabled = shadows;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    // insert the renderer after the heading using jquery
    $(document).ready(function () {
      $("#3dwindow").html(renderer.domElement);
    }); 
    // create camera:
    camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, 100000 );
    camera.position.z = 100;
    scene.add(camera);

    //update the viewport on resize:
    window.addEventListener('resize', function() {
      var WIDTH = document.getElementById("3dwindow").parentElement.clientWidth;
      var HEIGHT = WIDTH/2;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });
    
    // lighting:
    var light = new THREE.DirectionalLight(0xfffff3,1.5);
    camera.add(light);
    light.position.set(0,0,1);
    light.target = camera;
    light.castShadow = shadows;
    light.shadowDarkness = 0.8;

    // load collada file:
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( filename, function ( collada ) {
      var dae = collada.scene;
      dae.position.set(0,0,0); //x,z,y in blender dimensions
      dae.scale.set(1.0,1.0,1.0);
      scene.add(dae);
      // set camera position
      var bbox = new THREE.BoundingBoxHelper(dae, 0xff0000);
      bbox.update();
      var xspan = bbox.box.max.x-bbox.box.min.x;
      var yspan = bbox.box.max.y-bbox.box.min.y;
      var zspan = bbox.box.max.z-bbox.box.min.z;
      var radius = Math.sqrt(xspan*xspan+yspan*yspan+zspan*zspan)/2;
      camera.position.y -= 2*radius;
      camera.lookAt(dae.position);
      // enable shadows on geometries:
      if (shadows) {
        enableShadows(dae);
      }  
      // calls a function that will run after all this got set up:
      callback(dae);        
    });

    // rotate, grab and zoom needs OrbitControls or TrackballControls:
    controls = new THREE.TrackballControls(camera, document.getElementById("3dwindow"));
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 0.2;
    controls.panSpeed = 0.5;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.1;
    controls.keys = [ 65, 83, 68 ];
    //controls.target.set( 0, 0, 0 );
    //controls.addEventListener( 'change', render );

    // draw a border around the canvas
    renderer.domElement.style = "border: 1px solid #aaaaaa"
    
  }

  //redraws the frame fter zooming/rotating:
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }  
} 