function createNucleicAcids(module) {

    // DNA properties (type B):
    var scale = 4;
    var radius = 1.0; //nm
    var pitch = 3.32; //nm
    var basesPerTurn = 8; // theoretically 10.5, but 8 looks ok
    var resolution = 8; // 8 looks ok

    // Create helix cross-sectional geometry:
    var helixShape = new THREE.Shape();
    var longSide = 0.22; //0.2
    var shortSide = 0.065; //0.07
    helixShape.ellipse(0, 0, longSide/2, shortSide/2, 0, 2*Math.PI, true, 0.4*Math.PI);    


    ///////////////////////////////////////////////////////////////////////////////////////////////

    //var pos = new THREE.Vector3(-5.842881325672321, -5.8371807191324620, 4.6611525722939830);
    //var rot = new THREE.Euler(1.0803845763917383, -0.5693376552550835, 0.8406934403471152);  
    var pos = new THREE.Vector3(3.199786820906784, -6.674090401511426, 8.71901282325824);
    var rot = new THREE.Euler(0.8568845637812872, 0.2553869901965827, 0.05930168078713633);    
    
    // Floppy RNA (part of gRNA that will wrap around target DNA)
    var floppyRna = createFloppyRNA();
    floppyRna.position.copy(pos);
    floppyRna.rotation.copy(rot);
    module.rna.add(floppyRna);
    module.naParts['floppyRna'] = floppyRna;   
    
    // DNA (before cut)
    var dnaPreCut = createDNApreCut();      
    module.dna.add(dnaPreCut);
    module.naParts['dnaPreCut'] = dnaPreCut;

    // cut DNA part 1
    var dnaPostCut1 = createDNApostCut1();
    module.dna.add(dnaPostCut1);
    module.naParts['dnaPostCut1'] = dnaPostCut1;
    dnaPostCut1.visible = false;

    // cut DNA part 2
    var dnaPostCut2 = createDNApostCut2();
    module.dna.add(dnaPostCut2);
    module.naParts['dnaPostCut2'] = dnaPostCut2;
    dnaPostCut2.visible = false;

    // Adjust to cas9 position and rotation
    module.dna.children.forEach(function(c) {
        if (c instanceof THREE.Object3D) {
            c.position.copy(pos);
            c.rotation.copy(rot);
        }    
    });

    // Fog caps to mask ends
    var dnaEnds  = [
        new THREE.Vector3(28.16, -225.26, 138.92),
        new THREE.Vector3(-131.19, 104.14, -200.78),
    ];
    var caps = module.createFogCaps(dnaEnds, 300);
    module.dna.add(caps);

    // Cutting halos
    var cutPos  = [
        new THREE.Vector3(4.885, 2.436, 2.508),
        new THREE.Vector3(-5.228, -4.447, 5.585),
    ];
    var cutHalos = module.createFogCaps(cutPos, 4, "textures/cutHalo.png");
    cutHalos.children[0].material.opacity = 0;
    module.dna.add(cutHalos);   
    module.naParts['cutHalos'] = cutHalos;

    // Add to scene
    module.dna.brownianDisplacement = 0;
    module.dna.brownianJumpiness = 0.5;     
    module.scene.add(module.dna);    

    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Basic function to create DNA double helix geometries
     */
    function createDNAgeometry(pathObjList, extrusionSteps) {

        // Function to check how to tie parts together:
        function checkCrossing(oldList1, newList1, oldList2, newList2) {
            var crossing = false;
            if (oldList1.length>0) {
                var dist11 = oldList1[oldList1.length-1].distanceTo(newList1[0]);
                var dist12 = oldList1[oldList1.length-1].distanceTo(newList2[0]);
                var dist21 = oldList2[oldList2.length-1].distanceTo(newList1[0]);
                var dist22 = oldList2[oldList2.length-1].distanceTo(newList2[0]);
                var distII = dist11 + dist22;
                var distX = dist12 + dist21;
                crossing = (distX<distII) ? true : false;                        
            }
            return crossing;
        }        

        // Loop over pathObjects:
        var strand1vertices = [];
        var strand2vertices = [];
        var i, obj;
        for (i=0; i<pathObjList.length; i++) {
            obj = pathObjList[i];
            if (obj.doublehelix) {
                // Create backbone curve:
                var bbCurve = new THREE.CatmullRomCurve3(obj.points1);
                // Spiral around backbone to create helices:
                var temp1vertices = [];
                var temp2vertices = [];
                var bbLength = bbCurve.getLength();
                var nrOfBases = Math.floor((bbLength/pitch)*basesPerTurn);
                var backBoneVertices = bbCurve.getSpacedPoints(nrOfBases);
                var baseNr, angle, x,y,z;
                var currentQuat = new THREE.Quaternion();
                var currentBackBone = new THREE.Vector3();
                var currentDial1 = new THREE.Vector3();
                var currentSummed1 = new THREE.Vector3();
                var currentDial2 = new THREE.Vector3();
                var currentSummed2 = new THREE.Vector3();    
                var currentTangent = new THREE.Vector3();
                var previousBackBone = new THREE.Vector3();
                var zVec = new THREE.Vector3(0, 0, 1);
                for (baseNr=0; baseNr<nrOfBases; baseNr++) {
                    angle1 = baseNr*2*Math.PI/basesPerTurn + obj.angleOffsets[0];
                    angle2 = angle1 + obj.angleOffsets[1];
                    currentDial1 = new THREE.Vector3(radius * Math.cos(angle1), radius * Math.sin(angle1), 0);
                    currentDial1.applyQuaternion(currentQuat);
                    currentDial2 = new THREE.Vector3(radius * Math.cos(angle2), radius * Math.sin(angle2), 0);
                    currentDial2.applyQuaternion(currentQuat);        
                    currentBackBone = backBoneVertices[baseNr];
                    currentSummed1.addVectors(currentBackBone, currentDial1);
                    currentSummed2.addVectors(currentBackBone, currentDial2);
                    temp1vertices.push(currentSummed1.clone());
                    temp2vertices.push(currentSummed2.clone());
                    if (baseNr>0) {
                        currentTangent.subVectors(currentBackBone, previousBackBone).normalize();
                        currentQuat.setFromUnitVectors(zVec, currentTangent);    
                    }
                    previousBackBone = currentBackBone.clone();
                }
                // Figure out how to connect ends:
                var crossing = checkCrossing(strand1vertices, temp1vertices, strand2vertices, temp2vertices);
                if (crossing) {
                    strand1vertices = strand1vertices.concat(temp2vertices);
                    strand2vertices = strand2vertices.concat(temp1vertices);
                } else {
                    strand1vertices = strand1vertices.concat(temp1vertices);
                    strand2vertices = strand2vertices.concat(temp2vertices);                
                }

            } else {
                // Simply add vertices to strand vertices, ensuring closest ends are connected:
                var crossing = checkCrossing(strand1vertices, obj.points1, strand2vertices, obj.points2);
                if (crossing) {
                    strand1vertices = strand1vertices.concat(obj.points2);
                    strand2vertices = strand2vertices.concat(obj.points1);
                } else {
                    strand1vertices = strand1vertices.concat(obj.points1);
                    strand2vertices = strand2vertices.concat(obj.points2);                
                }
            }

        }

        // Extrude both strands:
        var helixSpline1 = new THREE.CatmullRomCurve3(strand1vertices);
        var helixSpline2 = new THREE.CatmullRomCurve3(strand2vertices);
        //console.log('Strand lengths:', helixSpline1.getLength(), helixSpline2.getLength());
        var helixGeom1 = new THREE.ExtrudeGeometry(helixShape, { steps : extrusionSteps, extrudePath : helixSpline1 });
        var helixGeom2 = new THREE.ExtrudeGeometry(helixShape, { steps : extrusionSteps, extrudePath : helixSpline2 });
        
        // Return list of the two strand geometries:
        return [helixGeom1, helixGeom2];

    }


    /**
     * Creates Floppy RNA (part of gRNA that will wrap around target DNA)
     */
    function createFloppyRNA() {

        // Create helix container
        rnaObj = new THREE.Object3D();   
        rnaObj.scale.set(scale, scale, scale);

        // Gather vertices for unfolded shape
        var rnaPathObj = {
            doublehelix: false,
            points1: [
                new THREE.Vector3(-0.16370690695911244, -1.7376220683912846, -3.332705870590946),
                new THREE.Vector3(-0.5252711391915935, -1.394432904812714, -3.2939267742938227),
                new THREE.Vector3(-1.128,-0.423, -3.996), // ok
                //new THREE.Vector3(-2.556,-0.325, -5.499), // original
                new THREE.Vector3(-2.909, 0.0692, -5.160), // new
                //new THREE.Vector3(-3.709,-0.989, -5.734), // original
                new THREE.Vector3(-4.426, -0.857, -6.893), // new
                new THREE.Vector3(-6.268,-1.5, -7.382), // ok
            ],
            points2: [
                new THREE.Vector3(-0.16370690695911244, -1.7376220683912846, -3.332705870590946),
                new THREE.Vector3(-0.5252711391915935, -1.394432904812714, -3.2939267742938227),
                new THREE.Vector3(-0.811, -0.348, -3.489),
                new THREE.Vector3(-1.055, 0.476, -4.041),
                new THREE.Vector3(-1.181, 0.564, -4.870),
                new THREE.Vector3(-1.381, -0.210, -5.886),
                new THREE.Vector3(-2.225, -1.356, -5.566),
                new THREE.Vector3(-2.851, -1.486, -4.991),
                new THREE.Vector3(-3.549, -1.143, -4.372),
            ],
            angleOffsets: [],
        }

        var pathObjList = [rnaPathObj];
        var extrudeQuality = 40;

        // Create Geometries:
        var rnaGeometries = createDNAgeometry(pathObjList, extrudeQuality);
        var rnaGeom1 = rnaGeometries[0];
        var rnaGeom2 = rnaGeometries[1];

        // Add Morph targets:
        rnaGeom1.morphTargets.push({ name: "A", vertices: rnaGeom1.vertices });
        rnaGeom1.morphTargets.push({ name: "B", vertices: rnaGeom2.vertices });    

        // Create Meshes:
        var rnaMesh1 = new THREE.Mesh(rnaGeom1, module.materials.rnaMat1m);
        rnaObj.add(rnaMesh1);

        // Compute Normals:
        rnaMesh1.geometry.computeVertexNormals();
        rnaMesh1.geometry.computeMorphNormals(); 

        // Debug only:
        if (false) {
            var boxGeom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            var boxMat = new THREE.MeshLambertMaterial({color: 0xff0000});
            var boxMesh = new THREE.Mesh(boxGeom, boxMat);
            boxMesh.position.set(-2.909, 0.0692, -5.160);
            rnaObj.add(boxMesh);
            var transControls = new THREE.TransformControls(module.camera, module.renderer.domElement);
            transControls.attach(boxMesh);
            module.scene.add(transControls);    
            module.box = boxMesh;
        }  

        return rnaObj;
    }



    /**
     * Creates DNA that Cas9 will bind to, before cutting
     */
    function createDNApreCut() {

        // Create helix container
        dnaObj = new THREE.Object3D();    
        dnaObj.scale.set(scale, scale, scale);

        // Gather vertices for unfolded shape
        var helixPoints1 = [
            new THREE.Vector3(-20, -20, -60),
            new THREE.Vector3(-14, 0, -12),
            new THREE.Vector3(-6, 0, -7),
        ];
        var helixPoints3 = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(10, 0, 20),
            new THREE.Vector3(-10, -10, 60),
        ]
        var dnaPathObj0 = {
            doublehelix: true,
            points1: helixPoints1.concat(helixPoints3),
            points2: [],
            angleOffsets: [0, 1.2*Math.PI],
        }    
        var dnaPathObj1 = {
            doublehelix: true,
            points1: [new THREE.Vector3(-20, -20, -61.5)].concat(helixPoints1),
            points2: [],
            angleOffsets: [0, 1.2*Math.PI],
        }
        var dnaPathObj2 = {
            doublehelix: false,
            points1: [
                new THREE.Vector3(-3.933, -1.621, -6.295),
                new THREE.Vector3(-3.164, -0.027, -6.339),
                new THREE.Vector3(-2.998, 0.382, -5.407),
                new THREE.Vector3(-2.529, -0.349, -4.456),
                new THREE.Vector3(-1.750, -1.139, -4.390),
                new THREE.Vector3(-0.597, -1.505, -4.870),
                new THREE.Vector3(0.867, -0.986, -4.804),
                new THREE.Vector3(1.193, 0.164, -3.176),
                new THREE.Vector3(1.118, 0.156, -2.631), // CUT!
                new THREE.Vector3(0.797, -0.447, -1.266)
            ],
            points2: [
                new THREE.Vector3(-6.038, 1.588, -5.994),
                new THREE.Vector3(-4.099, 1.898, -4.379),
                new THREE.Vector3(-3.548, 1.709, -3.428),
                new THREE.Vector3(-2.992, 0.448, -2.603),
                new THREE.Vector3(-2.069, -0.090, -1.826), // CUT!
                new THREE.Vector3(-1.250, -0.096, -0.876)
            ],
            angleOffsets: [],
        }
        var dnaPathObj3 = {
            doublehelix: true,
            points1: helixPoints3.concat([new THREE.Vector3(-10, -10, 62)]),
            points2: [],
            angleOffsets: [0, 1.2*Math.PI],
        }
            
        
        var pathObjList1 = [dnaPathObj0];
        var pathObjList2 = [dnaPathObj1, dnaPathObj2, dnaPathObj3];

        var extrudeQuality = 750;

        // Create Geometries:
        var dnaGeometries = createDNAgeometry(pathObjList1, extrudeQuality);
        var dnaGeom1 = dnaGeometries[0];
        var dnaGeom2 = dnaGeometries[1];

        // Add Morph targets:
        var dnaGeometriesMorphed1 = createDNAgeometry(pathObjList2, extrudeQuality);
        var dnaGeom1morphed1 = dnaGeometriesMorphed1[0];
        var dnaGeom2morphed1 = dnaGeometriesMorphed1[1];
        dnaGeom1.morphTargets.push({ name: "1", vertices: dnaGeom1.vertices });
        dnaGeom2.morphTargets.push({ name: "1", vertices: dnaGeom2.vertices });    
        dnaGeom1.morphTargets.push({ name: "2", vertices: dnaGeom1morphed1.vertices });
        dnaGeom2.morphTargets.push({ name: "2", vertices: dnaGeom2morphed1.vertices });
       
        // Create Meshes:
        var dnaMesh1 = new THREE.Mesh(dnaGeom1, module.materials.dnaMat1m);
        var dnaMesh2 = new THREE.Mesh(dnaGeom2, module.materials.dnaMat2m);
        dnaObj.add(dnaMesh1);
        dnaObj.add(dnaMesh2);

        // Compute Normals:
        dnaMesh1.geometry.computeVertexNormals();
        dnaMesh2.geometry.computeVertexNormals();
        dnaMesh1.geometry.computeMorphNormals();    
        dnaMesh2.geometry.computeMorphNormals(); 

        return dnaObj;
    }


    /**
     * Creates first DNA piece after cut
     */
    function createDNApostCut1() {

        // Create helix container
        dnaObj = new THREE.Object3D();
        dnaObj.position.set(1.353, -10.015, 5.629);
        dnaObj.rotation.set(1.241, 0.007, 0);    
        dnaObj.scale.set(scale, scale, scale);

        // Gather vertices for unfolded shape
        var helixPoints1 = [
            new THREE.Vector3(-20, -20, -60),
            new THREE.Vector3(-14, 0, -12),
            new THREE.Vector3(-6, 0, -7),
        ];

       
        var dnaPathObj1 = {
            doublehelix: true,
            points1: [new THREE.Vector3(-20, -20, -61.5)].concat(helixPoints1),
            points2: [],
            angleOffsets: [0, 1.2*Math.PI],
        }
        var dnaPathObj2 = {
            doublehelix: false,
            points1: [
                new THREE.Vector3(-3.933, -1.621, -6.295),
                new THREE.Vector3(-3.164, -0.027, -6.339),
                new THREE.Vector3(-2.998, 0.382, -5.407),
                new THREE.Vector3(-2.529, -0.349, -4.456),
                new THREE.Vector3(-1.750, -1.139, -4.390),
                new THREE.Vector3(-0.597, -1.505, -4.870),
                new THREE.Vector3(0.867, -0.986, -4.804),
                new THREE.Vector3(1.193, 0.164, -3.176),
                new THREE.Vector3(1.118, 0.156, -2.631), // CUT!
            ],
            points2: [
                new THREE.Vector3(-6.038, 1.588, -5.994),
                new THREE.Vector3(-4.099, 1.898, -4.379),
                new THREE.Vector3(-3.548, 1.709, -3.428),
                new THREE.Vector3(-2.992, 0.448, -2.603),
                new THREE.Vector3(-2.069, -0.090, -1.826), // CUT!
            ],
            angleOffsets: [],
        }

                
        var pathObjList = [dnaPathObj1, dnaPathObj2];

        var extrudeQuality = 375;

        // Create Geometries:
        var dnaGeometries = createDNAgeometry(pathObjList, extrudeQuality);
        var dnaGeom1 = dnaGeometries[0];
        var dnaGeom2 = dnaGeometries[1];
       
        // Create Meshes:
        var dnaMesh1 = new THREE.Mesh(dnaGeom1, module.materials.dnaMat1);
        var dnaMesh2 = new THREE.Mesh(dnaGeom2, module.materials.dnaMat2);
        dnaObj.add(dnaMesh1);
        dnaObj.add(dnaMesh2);

        // Compute Normals just to make stuff look smooth:
        dnaMesh1.geometry.computeVertexNormals();
        dnaMesh2.geometry.computeVertexNormals();         

        return dnaObj;
    }


    /**
     * Creates second DNA piece after cut
     */
    function createDNApostCut2() {

        // Create helix container
        dnaObj = new THREE.Object3D();
        dnaObj.position.set(1.353, -10.015, 5.629);
        dnaObj.rotation.set(1.241, 0.007, 0);    
        dnaObj.scale.set(scale, scale, scale);

        // Gather vertices for unfolded shape   
        var dnaPathObj2 = {
            doublehelix: false,
            points1: [
                new THREE.Vector3(1.118, 0.156, -2.631), // CUT!
                new THREE.Vector3(0.797, -0.447, -1.266)
            ],
            points2: [
                new THREE.Vector3(-2.069, -0.090, -1.826), // CUT!
                new THREE.Vector3(-1.250, -0.096, -0.876)
            ],
            angleOffsets: [],
        }
        var helixPoints3 = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(10, 0, 20),
            new THREE.Vector3(-10, -10, 60),
        ]
        var dnaPathObj3 = {
            doublehelix: true,
            points1: helixPoints3.concat([new THREE.Vector3(-10, -10, 62)]),
            points2: [],
            angleOffsets: [0, 1.2*Math.PI],
        }      

        var pathObjList = [dnaPathObj2, dnaPathObj3];

        var extrudeQuality = 375;

        // Create Geometries:
        var dnaGeometries = createDNAgeometry(pathObjList, extrudeQuality);
        var dnaGeom1 = dnaGeometries[0];
        var dnaGeom2 = dnaGeometries[1];
       
        // Create Meshes:
        var dnaMesh1 = new THREE.Mesh(dnaGeom1, module.materials.dnaMat1);
        var dnaMesh2 = new THREE.Mesh(dnaGeom2, module.materials.dnaMat2);
        dnaObj.add(dnaMesh1);
        dnaObj.add(dnaMesh2);

        // Compute Normals just to make stuff look smooth:
        dnaMesh1.geometry.computeVertexNormals();
        dnaMesh2.geometry.computeVertexNormals();

        return dnaObj;
    }


    return module;
}