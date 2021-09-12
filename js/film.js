function createFilmSpool(popupDiv) {

	// parameters:
	var innerRadius = 2, outerRadius = 7, spoolHeight = 3.5, nrOfSpokes = 3;
	var filmFormat = 3, filmLength = 64, perfSize = 0.3;
	var spoolMat = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0xaaffaa, shininess: 50, side: THREE.DoubleSide} );
	var filmMat = new THREE.MeshBasicMaterial( { color: 0x111111, side: THREE.DoubleSide} );//, morphTargets: true, morphNormals: true } );
    var perfMat = new THREE.MeshBasicMaterial( { color: 0x777777, side: THREE.DoubleSide} );
    var x = 20, y = -10;

    // create container object:
    var film = new THREE.Object3D();
    film.position.set(x, y, 0)

    // film spool:
    var filmSpool = new THREE.Geometry();
    var spoolRoll = new THREE.CylinderGeometry(innerRadius, innerRadius, spoolHeight, 32, 1, true);
    var spoolRollMesh = new THREE.Mesh(spoolRoll); 
    spoolRollMesh.rotation.x = Math.PI/2;
    spoolRollMesh.updateMatrix();
    filmSpool.merge(spoolRollMesh.geometry, spoolRollMesh.matrix);        
    var spoolInnerTorus = new THREE.TorusGeometry(innerRadius, 0.1, 8, 32);              
    var spoolInnerTorusMesh = new THREE.Mesh(spoolInnerTorus);
    spoolInnerTorusMesh.position.set(0, 0, spoolHeight/2);
    spoolInnerTorusMesh.updateMatrix();
    filmSpool.merge(spoolInnerTorusMesh.geometry, spoolInnerTorusMesh.matrix);
    spoolInnerTorusMesh.position.set(0, 0, -spoolHeight/2);
    spoolInnerTorusMesh.updateMatrix();
    filmSpool.merge(spoolInnerTorusMesh.geometry, spoolInnerTorusMesh.matrix);        
    var spoolOuterTorus = new THREE.TorusGeometry(outerRadius, 0.1, 8, 64);              
    var spoolOuterTorusMesh = new THREE.Mesh(spoolOuterTorus);
    spoolOuterTorusMesh.position.set(0, 0, spoolHeight/2);
    spoolOuterTorusMesh.updateMatrix();
    filmSpool.merge(spoolOuterTorusMesh.geometry, spoolOuterTorusMesh.matrix);
    spoolOuterTorusMesh.position.set(0, 0, -spoolHeight/2);
    spoolOuterTorusMesh.updateMatrix();
    filmSpool.merge(spoolOuterTorusMesh.geometry, spoolOuterTorusMesh.matrix);
    var points = [];
    points.push( new THREE.Vector2(innerRadius, -0.01) );
    points.push( new THREE.Vector2(outerRadius, -0.01) );
    points.push( new THREE.Vector2(innerRadius, 0) );
    points.push( new THREE.Vector2(outerRadius, 0) );
    filmCapGeom = new THREE.LatheGeometry(points, 48);
    filmCapMesh = new THREE.Mesh(filmCapGeom);
    filmCapMesh.rotation.x = Math.PI/2;
    filmCapMesh.position.setZ(spoolHeight/2);
    filmCapMesh.updateMatrix();
    filmSpool.merge(filmCapMesh.geometry, filmCapMesh.matrix);
    filmCapMesh.position.setZ(-spoolHeight/2);
    filmCapMesh.updateMatrix();
    filmSpool.merge(filmCapMesh.geometry, filmCapMesh.matrix);    
    var filmSpokesMesh, angle = 0;
    var spokeLength = outerRadius-innerRadius, spokePos = (innerRadius+outerRadius)/2;
    var filmSpoke = new THREE.CylinderGeometry(0.1, 0.1, spokeLength, 8, 1, true);
    var i;
    for (i = 0; i < nrOfSpokes; i++) {
        angle = i*Math.PI*2/nrOfSpokes;
        filmSpokesMesh = new THREE.Mesh(filmSpoke);
        filmSpokesMesh.rotation.z = -angle;
        filmSpokesMesh.position.set(spokePos*Math.sin(angle), spokePos*Math.cos(angle), spoolHeight/2);
        filmSpokesMesh.updateMatrix();
        filmSpool.merge(filmSpokesMesh.geometry, filmSpokesMesh.matrix);
        filmSpokesMesh.position.set(spokePos*Math.sin(angle), spokePos*Math.cos(angle), -spoolHeight/2);
        filmSpokesMesh.updateMatrix();
        filmSpool.merge(filmSpokesMesh.geometry, filmSpokesMesh.matrix);                                  
    }
    var filmSpoolMesh = new THREE.Mesh(filmSpool, spoolMat);
    filmSpoolMesh.castShadow = true;
    filmSpoolMesh.receiveShadow= true;
    
    // the rolled film:
    var filmShape = new THREE.Shape();
    var filmThickness = 0.001;
    filmShape.moveTo(0, 0);
    filmShape.lineTo(0, filmThickness);
    filmShape.lineTo(filmFormat, filmThickness);
    filmShape.lineTo(filmFormat, 0);
    filmShape.lineTo(0, 0);
    var filmVertices = [];
    var a = 6, b = 0, c =0.1, angle = 0;
    for (i = 0; i < filmLength; i++) {
        angle = c * i;
        filmVertices.push(new THREE.Vector3( (a+b*angle)*Math.cos(angle), (a+b*angle)*Math.sin(angle), filmFormat/2 ));
    }
    b = 0.5;
    for (i = 0; i < filmLength; i++) {
        angle = c * i;
        filmVertices.push(new THREE.Vector3( (a+b*angle)*Math.cos(angle), (a+b*angle)*Math.sin(angle), filmFormat/2 )); //  (1 - (i/filmLength))*filmFormat/2 )
    }
    var filmSpline = new THREE.CatmullRomCurve3(filmVertices);
    var filmGeom = new THREE.ExtrudeGeometry(filmShape, { steps : 2*filmLength, extrudePath : filmSpline });
    var filmMesh = new THREE.Mesh(filmGeom, filmMat);

    // film perfs:
    var allPerfsGeom = new THREE.Geometry();
    var perfGeom = new THREE.BoxGeometry(perfSize, perfSize, 10*filmThickness);
    for (i=0; i<filmVertices.length-1; i++) {
        var perfMesh = new THREE.Mesh(perfGeom, perfMat);
        perfMesh.position.set(filmVertices[i].x, filmVertices[i].y, 2*perfSize); //filmVertices[i].y+2*filmThickness
        perfMesh.lookAt(new THREE.Vector3(0, 0, 2*perfSize));
        perfMesh.updateMatrix();
        allPerfsGeom.merge(perfMesh.geometry, perfMesh.matrix);
        perfMesh.position.setZ(spoolHeight-2*perfSize);
        perfMesh.updateMatrix();
        allPerfsGeom.merge(perfMesh.geometry, perfMesh.matrix);
    }
    var filmPerfsMesh = new THREE.Mesh(allPerfsGeom, perfMat);

    // set position:
    filmMesh.position.set(0, 0, spoolHeight/2);
    filmSpoolMesh.position.set(0, 0, (spoolHeight/2)+0.1);

    // add stuff to container object:
    film.add(filmMesh, filmPerfsMesh, filmSpoolMesh);

    // animation:
    film.animate = function(t) {
        var focus = false;
        var targetConfig;
        var currentConfig = {
            filmRotX: film.rotation.x,
            filmRotY: film.rotation.y,
            filmRotZ: film.rotation.z,
            filmPosX: film.position.x,
            filmPosY: film.position.y,
            filmPosZ: film.position.z,
        };
        var initConfig = {
            filmRotX: 0,
            filmRotY: 0,
            filmRotZ: 0,
            filmPosX: x,
            filmPosY: y,
            filmPosZ: 0.5,
        };
        var interConfig = {
            filmRotX: -Math.PI/2,
            filmRotY: 0.17,         
            filmRotZ: 0,    
            filmPosX: x, 
            filmPosY: 1.5*y,
            filmPosZ: outerRadius+2,
        }
        var finalConfig = {
            filmRotZ: Math.PI/2,
        };        
        if (t < 0) {
            t = -2*t;
            targetConfig = initConfig;
        } else {
            focus = true;
            targetConfig = interConfig;
        }
        var filmTween1 = new TWEEN.Tween(currentConfig).to(targetConfig, t);
        filmTween1.onUpdate(function() {
            film.position.set(currentConfig.filmPosX, currentConfig.filmPosY, currentConfig.filmPosZ);
            film.rotation.set(currentConfig.filmRotX, currentConfig.filmRotY, currentConfig.filmRotZ);
        });
        if (focus) {
            filmTween1.easing(TWEEN.Easing.Quadratic.InOut);
        } else {
            filmTween1.easing(TWEEN.Easing.Bounce.Out);
        }
        filmTween1.start();
        filmTween1.onComplete(function() {          
            if (focus) {
                var filmTween2 = new TWEEN.Tween(currentConfig).to(finalConfig, 2*t);
                filmTween2.onUpdate(function() {
                    film.rotation.z = (currentConfig.filmRotZ);
                });
                filmTween2.easing(TWEEN.Easing.Quadratic.InOut);
                filmTween2.start();
            }
        });

    }

    // on hover:
    film.hover = function(t) {
        var targetParams, focus=false;
        var currentParams = {
            posZ : film.position.z
        }
        var initParams = {
            posZ : 0.5                    
        };
        var finalParams = {
            posZ : 3.5                             
        };                
        if (t < 0) {
            targetParams = initParams;
            t = -t;
        } else {
            focus = true;
            targetParams = finalParams;
        }  
        var filmTweenHover = new TWEEN.Tween(currentParams).to(targetParams, t);
        var transition = function() {
            film.position.z = currentParams.posZ;
        }
        filmTweenHover.onUpdate(transition);
        if (focus) {
            filmTweenHover.easing(TWEEN.Easing.Quadratic.Out);
        } else {
            filmTweenHover.easing(TWEEN.Easing.Bounce.Out);
        }
        filmTweenHover.start();
    }

    // intro:
    film.intro = function(t) {
        var initParams = {
            posZ : 30                   
        };
        var finalParams = {
            posZ : 0                             
        };                 
        var filmTweenIntro = new TWEEN.Tween(initParams).to(finalParams, t);
        var transition = function() {
            film.position.z = initParams.posZ;
        }
        filmTweenIntro.onUpdate(transition);
        filmTweenIntro.easing(TWEEN.Easing.Bounce.Out);        
        filmTweenIntro.start();
    }

    // popup text content:

    film.htmlContentEn = "";
    film.htmlContentEn += "        <div class=\"row\" style=\"margin-top: 2%\">";
    film.htmlContentEn += "            <div class=\"twelve columns\">";
    film.htmlContentEn += "                <h4>";
    film.htmlContentEn += "                    Videos";
    film.htmlContentEn += "                <\/h4>";
    film.htmlContentEn += "                <p>";
    film.htmlContentEn += "                    We craft clear and memorable videos and animations, and are enthusiastic about presenting workshops and tutorials on scientific visualization.";
    film.htmlContentEn += "                <\/p>";
    film.htmlContentEn += "            <\/div>";
    film.htmlContentEn += "        <\/div>";
    film.htmlContentEn += "        <div class=\"caption\">";
    film.htmlContentEn += "            <div class=\"row\" style=\"margin-top: 0%\">";
    film.htmlContentEn += "                <div class=\"six columns\">";
    film.htmlContentEn += "                    <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/fnb3mov.jpg\">";
    film.htmlContentEn += "                        <source src=\"videos\/fnb3.mp4\" type=\"video\/mp4\">";
    film.htmlContentEn += "                        Your browser does not support the video tag.";
    film.htmlContentEn += "                    <\/video>";
    film.htmlContentEn += "                    <br>";
    film.htmlContentEn += "                    <p class=\"preventzoomout\">";
    film.htmlContentEn += "                        We can clarify complex data and visualize scientific findings with short 3D-animations. Featured here is a molecular dynamics simulation of a protein complex in the context of its environment. Published in <a href=\"docs\/structviz.pdf\" target=\"_blank\">“Graham T. Johnson and Sam Hertig,<\/a> Nature Reviews Molecular Cell Biology 15 (2014), 690-698.”<br>";
    film.htmlContentEn += "                        <a href=\"https:\/\/youtu.be\/yeIOTrbIx_Q\" target=\"_blank\">> Watch on Youtube<\/a>";
    film.htmlContentEn += "                    <\/p>";
    film.htmlContentEn += "                <\/div>";
    film.htmlContentEn += "                <div class=\"six columns\">";
    film.htmlContentEn += "                    <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/legohivmov.jpg\">";
    film.htmlContentEn += "                        <source src=\"videos\/legohiv.mp4\" type=\"video\/mp4\">";
    film.htmlContentEn += "                        Your browser does not support the video tag.";
    film.htmlContentEn += "                    <\/video>";
    film.htmlContentEn += "                    <br>";
    film.htmlContentEn += "                    <p class=\"preventzoomout\">";
    film.htmlContentEn += "                        Understanding scientific data should not be limited to experts in the field, but needs to be engaging for a wide range of audiences: Hertig Visualizations created this video of a human immunodeficiency virus (HIV) in blood plasma with Lego bricks. Molecular structures are based on a model obtained with <a href=\"http:\/\/www.autopack.org\/\" target=\"_blank\">cellPACK<\/a>. Received a honorary mention in a visualization challenge hosted on <a href=\"http:\/\/www.cgsociety.org\" target=\"_blank\">cgsociety.org.<\/a><br>";
    film.htmlContentEn += "                        <a href=\"https:\/\/youtu.be\/1WZHoy16Yww\" target=\"_blank\">> Watch on Youtube<\/a>";
    film.htmlContentEn += "                    <\/p>";
    film.htmlContentEn += "                <\/div>                ";
    film.htmlContentEn += "            <\/div>";
    film.htmlContentEn += "            <div class=\"row\" style=\"margin-top: 1%\">";
    film.htmlContentEn += "                <div class=\"six columns\">";
    film.htmlContentEn += "                   <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/stanfordpostersmov.jpg\">";
    film.htmlContentEn += "                        <source src=\"videos\/stanfordposters.mp4\" type=\"video\/mp4\">";
    film.htmlContentEn += "                        Your browser does not support the video tag.";
    film.htmlContentEn += "                    <\/video>              ";
    film.htmlContentEn += "                    <br>";
    film.htmlContentEn += "                    <p class=\"preventzoomout\">";
    film.htmlContentEn += "                        We are looking forward to talking about design principles of scientific visualization, or giving workshops on software and programming (with a focus on molecular graphics software and interactive web-based visualization).";
    film.htmlContentEn += "                        <a href=\"https:\/\/lane.stanford.edu\/classes-consult\/archive.html?class-id=635\" target=\"_blank\">\"Creating a Stunning Scientific Poster – Best Practices\"<\/a> was a talk presented by Sam Hertig at Stanford University in February 2016. This class provided an introduction to some basic principles of graphics design, and how these principles can guide the effective design of a scientific conference poster.<br>";
    film.htmlContentEn += "                        <a href=\"https:\/\/youtu.be\/EL5YwkiqBho\" target=\"_blank\">> Watch on Youtube<\/a>";
    film.htmlContentEn += "                        <br>";
    film.htmlContentEn += "                        <a href=\"http:\/\/www.nature.com\/nature\/journal\/v536\/n7614\/full\/nj7614-115a.html\" target=\"_blank\">> Article by Chris Woolston on Nature Careers<\/a>";
    film.htmlContentEn += "                    <\/p>";
    film.htmlContentEn += "                <\/div>";
    film.htmlContentEn += "            <\/div>";
    film.htmlContentEn += "        <\/div> ";


    film.htmlContentDe = "";
    film.htmlContentDe += "        <div class=\"row\" style=\"margin-top: 2%\">";
    film.htmlContentDe += "            <div class=\"twelve columns\">";
    film.htmlContentDe += "                <h4>";
    film.htmlContentDe += "                    Videos";
    film.htmlContentDe += "                <\/h4>";
    film.htmlContentDe += "                <p>";
    film.htmlContentDe += "                    Wir erstellen einprägsame wissenschaftliche Videos und Animationen, und freuen uns, unsere Kenntnisse über Scientific Visualization an Seminaren und Workshops weiterzuvermitteln.";
    film.htmlContentDe += "                <\/p>";
    film.htmlContentDe += "            <\/div>";
    film.htmlContentDe += "        <\/div>";
    film.htmlContentDe += "        <div class=\"caption\">";
    film.htmlContentDe += "            <div class=\"row\" style=\"margin-top: 0%\">";
    film.htmlContentDe += "                <div class=\"six columns\">";
    film.htmlContentDe += "                    <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/fnb3mov.jpg\">";
    film.htmlContentDe += "                        <source src=\"videos\/fnb3.mp4\" type=\"video\/mp4\">";
    film.htmlContentDe += "                        Your browser does not support the video tag.";
    film.htmlContentDe += "                    <\/video>";
    film.htmlContentDe += "                    <br>";
    film.htmlContentDe += "                    <p class=\"preventzoomout\">";
    film.htmlContentDe += "                        Kurze 3D-Animationsfilme sind ein ausgezeichnetes Instrument um komplexe wissenschaftliche Erkenntnisse und Daten zu erklären und zu erläutern. Im hier gezeigten Video wird die molekulare Dynamik eines Proteins simuliert (publiziert in “<a href=\"docs\/structviz.pdf\" target=\"_blank\">Graham T. Johnson and Sam Hertig, Nature Reviews Molecular Cell Biology <\/a>15 (2014), 690-698”).<br>";
    film.htmlContentDe += "                        <a href=\"https:\/\/youtu.be\/yeIOTrbIx_Q\" target=\"_blank\">> Auf Youtube ansehen<\/a>";
    film.htmlContentDe += "                    <\/p>";
    film.htmlContentDe += "                <\/div>            ";
    film.htmlContentDe += "                <div class=\"six columns\">";
    film.htmlContentDe += "                    <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/legohivmov.jpg\">";
    film.htmlContentDe += "                        <source src=\"videos\/legohiv.mp4\" type=\"video\/mp4\">";
    film.htmlContentDe += "                        Your browser does not support the video tag.";
    film.htmlContentDe += "                    <\/video>";
    film.htmlContentDe += "                    <br>";
    film.htmlContentDe += "                    <p class=\"preventzoomout\">";
    film.htmlContentDe += "                        Wissenschaftliche Daten sollten nicht nur den Experten vorbehalten sein. Um sie für breitere Kreise interessant und zugänglich zu machen, arbeitet Hertig Visualizations auch mit unkonventionellen Methoden und Instrumenten. Dieses Video zeigt einen HI-Virus in Blutplasma gebaut mit Legosteinen. Das zugrunde liegende molekulare Modell wurde mit der Software <a href=\"http:\/\/www.autopack.org\/\" target=\"_blank\">cellPACK<\/a> erstellt. Der Kurzfilm erhielt eine Auszeichnung in einer online Visualisierungs-Challenge <a href=\"http:\/\/www.cgsociety.org\" target=\"_blank\">(cgsociety.org).<\/a><br>";
    film.htmlContentDe += "                        <a href=\"https:\/\/youtu.be\/1WZHoy16Yww\" target=\"_blank\">> Auf Youtube ansehen<\/a>";
    film.htmlContentDe += "                    <\/p>";
    film.htmlContentDe += "                <\/div>";
    film.htmlContentDe += "            <\/div>";
    film.htmlContentDe += "            <div class=\"row\" style=\"margin-top: 1%\">";
    film.htmlContentDe += "                <div class=\"six columns\">";
    film.htmlContentDe += "                   <video controls class=\"preventzoomout u-max-full-width\" poster=\"images\/stanfordpostersmov.jpg\">";
    film.htmlContentDe += "                        <source src=\"videos\/stanfordposters.mp4\" type=\"video\/mp4\">";
    film.htmlContentDe += "                        Your browser does not support the video tag.";
    film.htmlContentDe += "                    <\/video>              ";
    film.htmlContentDe += "                    <br>";
    film.htmlContentDe += "                    <p class=\"preventzoomout\">";
    film.htmlContentDe += "";
    film.htmlContentDe += "                        Hertig Vizualisations veranstaltet Seminare über Design Prinzipien im Gebiet der Scientific Visualization sowie Software Workshops mit einem Schwerpunkt auf molekulare und interaktive Visualisierung. <a href=\"https:\/\/lane.stanford.edu\/classes-consult\/archive.html?class-id=635\" target=\"_blank\">\"Creating a Stunning Scientific Poster – Best Practices\"<\/a> wurde von Sam Hertig 2016 an der Stanford Universität präsentiert. Im Workshop wurde den Teilnehmenden Tipps und Tricks zur Gestaltung von wissenschaftlichen Konferenz-Postern vermittelt.";
    film.htmlContentDe += "                        <br>";
    film.htmlContentDe += "                        <a href=\"https:\/\/youtu.be\/EL5YwkiqBho\" target=\"_blank\">> Auf Youtube ansehen<\/a>";
    film.htmlContentDe += "                        <br>";
    film.htmlContentDe += "                        <a href=\"http:\/\/www.nature.com\/nature\/journal\/v536\/n7614\/full\/nj7614-115a.html\" target=\"_blank\">> Nature Careers Artikel lesen<\/a>";
    film.htmlContentDe += "                    <\/p>";
    film.htmlContentDe += "                <\/div>";
    film.htmlContentDe += "            <\/div>";
    film.htmlContentDe += "        <\/div>";
    

    film.getHtmlContent = function(lang) {
        switch (lang) {
            case 'de':
                return film.htmlContentDe;
                break;
            default:
                return film.htmlContentEn;
        }
    }

    film.urlName = "videos";
    return film;

}    