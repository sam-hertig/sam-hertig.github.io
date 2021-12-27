function createAmbiance(module) {

    var nrOfBubbles = 500;
    var bubbleSphereRadius = 200;
    var nrOfBgSprites = 30;
    var bgSpriteSphereRadius = 500;



    function createBubbles(nrOfBubbles, radius) {
        var bubblesGeom = new THREE.Geometry();
        for (var p = 0; p < nrOfBubbles; p++) {
            var x = (2*Math.random()-1) * radius;
            var y = (2*Math.random()-1) * radius;
            var z = (2*Math.random()-1) * radius;   
            var bubblePos = new THREE.Vector3(x, y, z);
            bubblesGeom.vertices.push(bubblePos);
        }
        var loader = new THREE.TextureLoader();
        var texture = loader.load("textures/bubble.png");  
        var bubbleMat = new THREE.PointsMaterial({
            color: 0xffffff, 
            size: 4,
            map: texture,
            blending: THREE.NormalBlending, //AdditiveBlending, NormalBlending
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            // depthTest: false,
            fog: false, 
        });
        return new THREE.Points(bubblesGeom, bubbleMat);
    }




    function createBgSprites(nrOfBgSprites, radius) {

        var spriteMaps = [
            new THREE.TextureLoader().load("textures/bgSprites-01.png"),
            new THREE.TextureLoader().load("textures/bgSprites-02.png"),
            new THREE.TextureLoader().load("textures/bgSprites-03.png"),
            new THREE.TextureLoader().load("textures/bgSprites-04.png"),
            new THREE.TextureLoader().load("textures/bgSprites-05.png"),
            new THREE.TextureLoader().load("textures/bgSprites-06.png")
        ];        

        var bgSprites = new THREE.Object3D();
        var Theta = 0, Phi = 0;
        var x, y, z, index, pos, posDelta, size;

        for (var j=0; j<nrOfBgSprites; j++) {

            Theta = 2*Math.PI*Math.random();
            Phi = Math.acos(1 - 2*Math.random()); 
            x = Math.sin(Phi) * Math.cos(Theta);
            y = Math.sin(Phi) * Math.sin(Theta);
            z = Math.cos(Phi); 

            pos = new THREE.Vector3(x, y, z);
            posDelta = Math.random()-0.5;
            pos.multiplyScalar( radius + (radius*posDelta) );

            index = j % spriteMaps.length;

            var spriteMap = spriteMaps[index];

            var spriteMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                color: 0xffffff,
                transparent: true,
                opacity: 0.4 - 0.2*(posDelta),
                depthWrite: false,
                // depthTest: false,
                fog: false,
                rotation: 2*Math.PI*Math.random(),                
            });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(pos);
            size = 0.1 * radius;
            size = (index===5) ? size*4 : size;
            bgSprites.add(sprite);
            sprite.rotSign = -1 + 2*Math.round(Math.random());
            sprite.scale.set(sprite.rotSign*size, size, size);
        }

        bgSprites.rotDir = 0;
        return bgSprites;
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////

    var bubbles = createBubbles(nrOfBubbles, bubbleSphereRadius);
    module.scene.add(bubbles);

    module.animateBubbles = function() {
        var verts = bubbles.geometry.vertices;
        for(var i = 0; i < verts.length; i++) {
            var vert = verts[i];
            if (vert.y > bubbleSphereRadius) {
                vert.y = (2*Math.random()-1) * bubbleSphereRadius;
            }
            vert.y = vert.y + (3.0 * module.deltaTime);
        }
        bubbles.geometry.verticesNeedUpdate = true;
        bubbles.rotation.y -= 0.03 * module.deltaTime;
    }



    var bgSprites = createBgSprites(nrOfBgSprites, bgSpriteSphereRadius);
    module.scene.add(bgSprites);

    module.animateBgSprites = function() {
        
        bgSprites.traverse(function(sprite) {
            if (sprite instanceof THREE.Sprite) {
                sprite.rotSign = (Math.random() > 0.9997) ? -1*sprite.rotSign : sprite.rotSign;
                sprite.material.rotation += 0.03 * module.deltaTime * sprite.rotSign;
            }
        });

        if (Math.random() > 0.9997) {
            bgSprites.rotDir += Math.round(6*Math.random());
            bgSprites.rotDir = bgSprites.rotDir % 6; 
        } else {
            if (bgSprites.rotDir <= 1) {
                bgSprites.rotation.x += (2*bgSprites.rotDir-1)*0.01*module.deltaTime;
            } else if (bgSprites.rotDir <= 3) {
                bgSprites.rotation.y += (2*(bgSprites.rotDir-2)-1)*0.01*module.deltaTime;
            } else {
                bgSprites.rotation.z += (2*(bgSprites.rotDir-4)-1)*0.01*module.deltaTime;
            }
        }

    }

    return module;
}



