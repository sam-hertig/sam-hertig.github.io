function createNucleus(module) {

    var scale = 4;
    var radius = 1500; // real 3000, last 1500
    var nrOfNpc = 30; // real 2000, last 80 (for full sphere)
    var npcRadius = 30; // real 60, last 30
    var holeRadius = npcRadius*1.2; // npcRadius*1.2


    function createNucleus() {

        var positions = [];
        var allNpcsGeom = new THREE.Geometry();

        var npcGeom = new THREE.Geometry();
        var subunitGeom = new THREE.SphereGeometry(npcRadius, 7, 7);
        var subunitMesh = new THREE.Mesh(subunitGeom);
        var i;
        for (i=0; i<8; i++) {
            subunitMesh.position.x = holeRadius*Math.cos(i*Math.PI/4);
            subunitMesh.position.y = holeRadius*Math.sin(i*Math.PI/4);
            subunitMesh.updateMatrix();
            npcGeom.merge(subunitMesh.geometry, subunitMesh.matrix);
        }
        var npcMesh = new THREE.Mesh(npcGeom);

        var holesGeom = new THREE.Geometry();
        var holeGeom = new THREE.PlaneGeometry(holeRadius, holeRadius);
        var holeMesh = new THREE.Mesh(holeGeom);


        var j, x, y, z, pos, dial;
        var zVec = new THREE.Vector3(0, 0, 1);
        var quat = new THREE.Quaternion();
        var Theta = 0, Phi =0;

        for (j=0; j<nrOfNpc; j++) {

            x = Math.sin(Phi) * Math.cos(Theta);
            y = Math.sin(Phi) * Math.sin(Theta);
            z = Math.cos(Phi); 
            pos = new THREE.Vector3(x, y, z);
            quat.setFromUnitVectors(zVec, pos);
            pos.multiplyScalar(radius+npcRadius/10);

            npcMesh.position.copy(pos);
            npcMesh.quaternion.copy(quat);
            npcMesh.updateMatrix();
            allNpcsGeom.merge(npcMesh.geometry, npcMesh.matrix);

            holeMesh.position.copy(pos);
            holeMesh.quaternion.copy(quat);
            holeMesh.updateMatrix();
            holesGeom.merge(holeMesh.geometry, holeMesh.matrix);

            Theta = 2*Math.PI*Math.random();
            Phi = 0;
            while (Phi < 0.2) { //prevent central npc from having overlaps with neighbours
                Phi = Math.acos(1 - Math.random()); //only cover half sphere to save memory            
                // Phi = Math.acos(1 - 2*Math.random());                 
            }

        }     
        
        var allNpcsBufferGeom = new THREE.BufferGeometry().fromGeometry(allNpcsGeom);
        var holesBufferGeom = new THREE.BufferGeometry().fromGeometry(holesGeom);

        var allNpcs = new THREE.Mesh(allNpcsGeom, module.materials.npcMat);
        var holes = new THREE.Mesh(holesBufferGeom, module.materials.npcHolesMat);

        var innerNucleusBufferGeom = new THREE.SphereBufferGeometry(radius-npcRadius, 20, 20);
        var innerNucleus = new THREE.Mesh(innerNucleusBufferGeom, module.materials.innerNucleusMat);
        innerNucleus.scale.set(-1, 1, 1);
        innerNucleus.rotation.order = 'XZY';  

        var outerNucleusBufferGeom = new THREE.SphereBufferGeometry(radius, 20, 20, 0, Math.PI, 0, Math.PI); //only cover half sphere to save memory
        var outerNucleus = new THREE.Mesh(outerNucleusBufferGeom, module.materials.outerNucleusMat);  

        var nucleus = new THREE.Object3D();
        nucleus.add(outerNucleus, allNpcs, holes, innerNucleus);

        nucleus.scale.set(scale, scale, scale);

        return nucleus;
        
    }

    // Create nucleus
    module.nucleus = new THREE.Object3D();
    var mainPart = createNucleus();
    module.nucleus.add(mainPart);

    // Create caps
    var poles = [
        new THREE.Vector3(0, -5000, 0),
        new THREE.Vector3(0, 5000, 0)
    ];
    var caps = module.createFogCaps(poles, 4000);    
    module.nucleus.add(caps);

    // Add to scene
    module.scene.add(module.nucleus);

    // Animation
    module.animateNucleus = function() {
        module.innerNucMatUniforms.time.value += module.deltaTime;
        module.outerNucMatUniforms.time.value += module.deltaTime;    
    }
    

    return module;
}