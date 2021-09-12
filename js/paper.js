function createPaperScroll(popupDiv) {  

    // paper parameters:
    var paperMat = new THREE.MeshPhongMaterial({ 
        color : 0x979383,
        specular : 0x000000,
        shininess: 1,
        morphTargets : true, 
        morphNormals : true, 
        side : THREE.DoubleSide, 
    });
    var paperLength = 17, paperThickness = 0.001;    
    var x = 0, y = 20, z=1.0;

    // pin parameters:
    var pinMat = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0xaaffaa, shininess: 50, side: THREE.DoubleSide} );   
    var pinSize = 1;

    // create container object:
    var paper = new THREE.Object3D();
    paper.position.set(x, y, z);

    // create rolled geometry:
    var paperShape = new THREE.Shape();
    paperShape.moveTo(0, 0);
    paperShape.lineTo(0, paperThickness);
    paperShape.lineTo(paperLength, paperThickness);
    paperShape.lineTo(paperLength, 0);
    paperShape.lineTo(0, 0);
    var paperVertices = [
        new THREE.Vector3(-10, 0, -0.5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(10, 0, 4),
        new THREE.Vector3(6, 0, 4),
        new THREE.Vector3(6, 0, 2)
    ];    
    var paperSpline = new THREE.CatmullRomCurve3(paperVertices);
    var paperGeom = new THREE.ExtrudeGeometry(paperShape, { steps : 100, extrudePath : paperSpline });
    paperGeom.morphTargets.push({ name: "rolled", vertices: paperGeom.vertices });    

    // add flat paper as a morph target to rolled geometry:
    paperVertices2 = [
        new THREE.Vector3(-14, 0, 0),
        new THREE.Vector3(0, 0, -1),        
        new THREE.Vector3(14, 0, 0),        
    ];
    var paperSpline2 = new THREE.CatmullRomCurve3(paperVertices2);
    var paperGeom2 = new THREE.ExtrudeGeometry(paperShape, { steps : 100, extrudePath : paperSpline2 });
    paperGeom.morphTargets.push({ name: "flat", vertices: paperGeom2.vertices });
    
    // create paper mesh:
    var paperMesh = new THREE.Mesh(paperGeom, paperMat);
    paperMesh.castShadow = true;
    paperMesh.receiveShadow = true;

    // create paper texture
    var texture = new THREE.TextureLoader().load('images/hemoglobin.png');
    var textMat = new THREE.MeshPhongMaterial({
        map: texture,      
        transparent: true,
        opacity: 1.0,      
    });
    var textMesh = new THREE.Mesh(new THREE.PlaneGeometry(128, 128),textMat);
    textMesh.scale.set(0.1, 0.1, 1);
    textMesh.position.set(0, -8.5, 0.1);
    textMesh.rotation.set(0,0,Math.PI/2);
    paperMesh.add(textMesh);

    // create pin:
    var points = [];
    points.push( new THREE.Vector2(0.001, -pinSize/4) );
    points.push( new THREE.Vector2(pinSize, 0) );
    points.push( new THREE.Vector2(pinSize/2, pinSize/2) );
    points.push( new THREE.Vector2(pinSize/2, pinSize) );
    points.push( new THREE.Vector2(pinSize, pinSize*3/2) );
    points.push( new THREE.Vector2(pinSize/4, pinSize*7/4) );
    points.push( new THREE.Vector2(0.001, pinSize*5) );
    var pinGeom = new THREE.LatheGeometry(points, 16);
    var pinMesh = new THREE.Mesh(pinGeom, pinMat);
    pinMesh.castShadow = true;   
    pinMesh.rotation.x = -1.45;
    pinMesh.position.x = -9;
    pinMesh.position.y = -paperLength/2;
    pinMesh.position.z = 3*pinSize;
    
    // add objects to container:
    paper.add(paperMesh, pinMesh);

    // rolling and unrolling:
    paper.animate = function(t) {
        var focus = false;
        var t1, t2;
        var targetParams;
        var currentParams = {
            morph : paperMesh.morphTargetInfluences[1],
            rotX : paperMesh.rotation.x,
            posZ : paperMesh.position.z,
            posY : paperMesh.position.y,
            pinZ : pinMesh.position.z
        }
        var initParams = {
            morph : 0,
            rotX : 0,
            posZ : 0,
            posY : 0,            
            pinZ : 3*pinSize            
        };
        var interParams = {
            morph : 1,
            rotX : -Math.PI/2,
            posZ : -0.7,
            posY : 0,
            pinZ : 300+3*pinSize           
        };
        var finalParams = {
            morph : 1,
            rotX : -Math.PI/2,
            posZ : -0.7,            
            posY: 40, //35
            pinZ : 300+3*pinSize                 
        };                
        if (t < 0) {
            targetParams = initParams;
            t2 = -2*t;
        } else {
            targetParams = finalParams;
            focus = true;
            t1 = t;
            t2 = 0.5*t;
        }  

        var paperTween1 = new TWEEN.Tween(currentParams).to(interParams, t1);
        var paperTween2 = new TWEEN.Tween(currentParams).to(targetParams, t2);

        var transition = function() {
            paperMesh.morphTargetInfluences[1]=currentParams.morph;
            paperMesh.rotation.x = currentParams.rotX;
            paperMesh.position.y = currentParams.posY;
            paperMesh.position.z = currentParams.posZ;
            pinMesh.position.z = currentParams.pinZ; 
        }

        paperTween1.onUpdate(transition);
        paperTween2.onUpdate(transition);

        if (focus) {
            paperTween1.easing(TWEEN.Easing.Quadratic.InOut);
            paperTween2.easing(TWEEN.Easing.Quadratic.In);
        } else {
            paperTween2.easing(TWEEN.Easing.Quadratic.InOut);
        }            

        if (focus) {
            paperTween1.onComplete(function() {
                initPhotoSwipeFromDOM('.my-gallery');
                paperTween2.start();
            });
            paperTween1.start();
        } else {
            paperTween2.start();
        }

    }

    // on hover:
    paper.hover = function(t) {
        var targetParams, focus = false;
        var currentParams = {
            posZ : paperMesh.position.z,
            pinZ : pinMesh.position.z
        }
        var initParams = {
            posZ : 0,          
            pinZ : 3*pinSize            
        };
        var finalParams = {
            posZ : 3,            
            pinZ : 10*pinSize                  
        };                
        if (t < 0) {
            targetParams = initParams;
            t = -t;
        } else {
            targetParams = finalParams;
            focus = true;
        }  
        var paperTweenHover = new TWEEN.Tween(currentParams).to(targetParams, t);
        var transition = function() {
            paperMesh.position.z = currentParams.posZ;
            pinMesh.position.z = currentParams.pinZ; 
        }
        paperTweenHover.onUpdate(transition);
        if (focus) {
            paperTweenHover.easing(TWEEN.Easing.Quadratic.Out);
        } else {
            paperTweenHover.easing(TWEEN.Easing.Quadratic.In);
        }        
		paperTweenHover.start();
        console.log(paperTweenHover);
    }

    // intro:
    paper.intro = function(t) {
        var initParams = {
            posZ : 30,
            pinZ : 30 + 6*pinSize
        };
        var finalParams = {
            posZ : 0,
            pinZ : 3*pinSize                           
        };                 
        var paperTweenIntro = new TWEEN.Tween(initParams).to(finalParams, t);
        var transition = function() {
            paperMesh.position.z = initParams.posZ;
        }
        paperTweenIntro.onUpdate(transition);
        paperTweenIntro.easing(TWEEN.Easing.Quadratic.Out);        
        paperTweenIntro.start();
        var pinTweenIntro = new TWEEN.Tween(initParams).to(finalParams, t);
        var transition = function() {
            pinMesh.position.z = initParams.pinZ;
        }
        pinTweenIntro.onUpdate(transition);
        pinTweenIntro.easing(TWEEN.Easing.Exponential.In);        
        pinTweenIntro.start();        
    }

    // popup text:
    paper.htmlContentEn = "";
    paper.htmlContentEn += "        <div class=\"row\" style=\"margin-top: 2%\">";
    paper.htmlContentEn += "            <div class=\"twelve columns\">";
    paper.htmlContentEn += "                <h4>";
    paper.htmlContentEn += "                    Graphics";
    paper.htmlContentEn += "                <\/h4>";
    paper.htmlContentEn += "                <p>";
    paper.htmlContentEn += "                    We create accurate and beautiful infographics, data visualizations, conference posters and  scientific illustrations.";
    paper.htmlContentEn += "                <\/p>";
    paper.htmlContentEn += "            <\/div>";
    paper.htmlContentEn += "        <\/div>";
    paper.htmlContentEn += "        <div class=\"my-gallery caption\">";
    paper.htmlContentEn += "            <div class=\"row\" style=\"margin-top: 0%\">";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/nup.jpg\" data-size=\"1200x1200\">";
    paper.htmlContentEn += "                        <img src=\"images\/nupthumb.jpg\" class=\"u-max-full-width\" alt=\"bla\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        We collaborate with scientists to help them share their discoveries with the world. Here, we worked with <a href=\"http:\/\/newswire.rockefeller.edu\/2016\/11\/10\/researchers-shed-new-light-on-rnas-journey-out-of-a-cells-nucleus\/\" target=\"blank\">a team of researchers at Rockefeller University and UCSF<\/a> to showcase their findings on the structure of a protein that acts as a gatekeeper for genetic information in the cell.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div> ";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/mdaposter.jpg\" data-size=\"1415x2000\">";
    paper.htmlContentEn += "                        <img src=\"images\/mdaposterthumb.jpg\" class=\"u-max-full-width\" alt=\"VizBi poster\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        Hertig Visualizations can help your research stand out at the next scientific conference. This poster was presented at the <a href=\"http:\/\/vizbi.org\/2015\/\" target=\"_blank\">conference on Visualization of Biological Data (VizBi) <\/a>in Boston in 2015, and earned the best poster award.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div>";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/allostery.jpg\" data-size=\"1200x1000\">";
    paper.htmlContentEn += "                        <img src=\"images\/allosterythumb.jpg\" class=\"u-max-full-width\" alt=\"Allostery review figure\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        We can clarify complex concepts for your next scientific publication. The above figure was created for <a href=\"http:\/\/dx.doi.org\/10.1371\/journal.pcbi.1004746\" target=\"_blank\">a review article in PLOS Computational Biology<\/a> on computer simulations of proteins.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div>";
    paper.htmlContentEn += "            <\/div>";
    paper.htmlContentEn += "            <div class=\"row\" style=\"margin-top: 1%\">";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/tokamak.jpg\" data-size=\"1200x1200\">";
    paper.htmlContentEn += "                        <img src=\"images\/tokamakthumb.jpg\" class=\"u-max-full-width\" alt=\"Tokamak infographics\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        Hertig Visualizations can assist you in presenting your data to a broad audience. This infographics describes the experimental fusion reactor at the <a href=\"http:\/\/actu.epfl.ch\/news\/swiss-plasma-center-to-harness-the-sun-s-energy-5\/\" target=\"_blank\">Swiss Plasma Center,<\/a> and was designed on behalf of Federal Institute of Technology Lausanne (EPFL), Switzerland.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div>             ";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/microtubule.jpg\" data-size=\"1200x800\">";
    paper.htmlContentEn += "                        <img src=\"images\/microtubulethumb.jpg\" class=\"u-max-full-width\" alt=\"Microtubule image\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        Illustration of a microtubule and kinesin accompanying <a href=\"https:\/\/www.ethz.ch\/en\/news-and-events\/eth-news\/news\/2014\/08\/Nanoscale-assembly-line.html\" target=\"_blank\">a news article<\/a> describing the scientific activities at the <a href=\"http:\/\/www.appliedmechanobio.ethz.ch\" target=\"_blank\">Laboratory for Applied Mechanobiology,<\/a> Federal Institute of Technology Zurich (ETHZ), Switzerland.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div> ";
    paper.htmlContentEn += "                <div class=\"four columns figure\">";
    paper.htmlContentEn += "                    <a href=\"images\/fnbpaposter.jpg\" data-size=\"1416x2000\">";
    paper.htmlContentEn += "                        <img src=\"images\/fnbpaposterthumb.jpg\" class=\"u-max-full-width\" alt=\"CSCS poster\">";
    paper.htmlContentEn += "                    <\/a>";
    paper.htmlContentEn += "                    <p>";
    paper.htmlContentEn += "                        Conference poster for the user day of the <a href=\"http:\/\/www.cscs.ch\" target=\"_blank\">Swiss Center for Scientific Computing (CSCS)<\/a> in Lucerne, Switzerland, 2011. Received the best poster award.";
    paper.htmlContentEn += "                    <\/p>";
    paper.htmlContentEn += "                <\/div>";
    paper.htmlContentEn += "            <\/div>";
    paper.htmlContentEn += "        <\/div>";



    paper.htmlContentDe = "";
    paper.htmlContentDe += "<div class=\"row\" style=\"margin-top: 2%\">";
    paper.htmlContentDe += "            <div class=\"twelve columns\">";
    paper.htmlContentDe += "                <h4>";
    paper.htmlContentDe += "                    Grafiken";
    paper.htmlContentDe += "                <\/h4>";
    paper.htmlContentDe += "                <p>";
    paper.htmlContentDe += "                    Wir kreieren ausdruckstarke, präzise und elegante Infografiken, Datenvisualisierungen, Konferenz-Poster und wissenschaftliche Illustrationen.";
    paper.htmlContentDe += "                <\/p>";
    paper.htmlContentDe += "            <\/div>";
    paper.htmlContentDe += "        <\/div>";
    paper.htmlContentDe += "        <div class=\"my-gallery caption\">";
    paper.htmlContentDe += "            <div class=\"row\" style=\"margin-top: 0%\">";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/nup.jpg\" data-size=\"1200x1200\">";
    paper.htmlContentDe += "                        <img src=\"images\/nupthumb.jpg\" class=\"u-max-full-width\" alt=\"bla\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Wir arbeiten mit Wissenschaftlern zusammen, um deren Entdeckungen innerhalb und ausserhalb ihres Fachgebietes breit zu streuen und zugänglich zu machen. Obenstehende Illustration entstand im Auftrag <a href=\"http:\/\/newswire.rockefeller.edu\/2016\/11\/10\/researchers-shed-new-light-on-rnas-journey-out-of-a-cells-nucleus\/\" target=\"blank\">eines Forschungsteams der Rockefeller Universität und der University of California, San Francisco (UCSF).<\/a> Sie zeigt die neugewonnenen Erkenntnisse über die Struktur eines Proteins, welches den Transport genetischer Information in der Zelle steuert.";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div> ";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/mdaposter.jpg\" data-size=\"1415x2000\">";
    paper.htmlContentDe += "                        <img src=\"images\/mdaposterthumb.jpg\" class=\"u-max-full-width\" alt=\"VizBi poster\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Hertig Visualizations verschafft Ihrem Forschungsprojekt an der nächsten Poster-Konferenz die nötige Aufmerksamkeit und stellt es ins Rampenlicht. Das oben abgebildete Poster wurde an der <a href=\"http:\/\/vizbi.org\/2015\/\" target=\"_blank\">Conference on Visualization of Biological Data (VizBi) <\/a>in Boston in 2015 präsentiert und erhielt die Auszeichnung \"Best Poster Award\".";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div>";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/allostery.jpg\" data-size=\"1200x1000\">";
    paper.htmlContentDe += "                        <img src=\"images\/allosterythumb.jpg\" class=\"u-max-full-width\" alt=\"Allostery review figure\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Wir sind auf die Veranschaulichung komplexer Konzepte spezialisiert und machen diese für wissenschaftliche Publikationen attraktiv. Dieses Bild über Computersimulationen von Proteinen wurde für <a href=\"http:\/\/dx.doi.org\/10.1371\/journal.pcbi.1004746\" target=\"_blank\">einen Review Artikel in der Fachzeitschrift PLOS Computational Biology<\/a>  kreiert.";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div>";
    paper.htmlContentDe += "            <\/div>";
    paper.htmlContentDe += "            <div class=\"row\" style=\"margin-top: 1%\">";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/tokamak.jpg\" data-size=\"1200x1200\">";
    paper.htmlContentDe += "                        <img src=\"images\/tokamakthumb.jpg\" class=\"u-max-full-width\" alt=\"Tokamak infographics\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Hertig Visualizations kann Ihnen helfen, Ihre Daten einem breiten Publikum zu vermitteln. Diese Infografik beschreibt den experimentellen Fusionsreaktor am <a href=\"http:\/\/actu.epfl.ch\/news\/swiss-plasma-center-to-harness-the-sun-s-energy-5\/\" target=\"_blank\">Swiss Plasma Center,<\/a> und wurde im Auftrag der EPFL erstellt.";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div>             ";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/microtubule.jpg\" data-size=\"1200x800\">";
    paper.htmlContentDe += "                        <img src=\"images\/microtubulethumb.jpg\" class=\"u-max-full-width\" alt=\"Microtubule image\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Illustration eines Mikrotubulus und des Proteins Kinesin, erschienen in einem<a href=\"https:\/\/www.ethz.ch\/en\/news-and-events\/eth-news\/news\/2014\/08\/Nanoscale-assembly-line.html\" target=\"_blank\"> Online-Bericht<\/a> über die Forschung am <a href=\"http:\/\/www.appliedmechanobio.ethz.ch\" target=\"_blank\">Laboratory for Applied Mechanobiology<\/a> an der ETHZ.";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div> ";
    paper.htmlContentDe += "                <div class=\"four columns figure\">";
    paper.htmlContentDe += "                    <a href=\"images\/fnbpaposter.jpg\" data-size=\"1416x2000\">";
    paper.htmlContentDe += "                        <img src=\"images\/fnbpaposterthumb.jpg\" class=\"u-max-full-width\" alt=\"CSCS poster\">";
    paper.htmlContentDe += "                    <\/a>";
    paper.htmlContentDe += "                    <p>";
    paper.htmlContentDe += "                        Konferenz-Poster für den User Day des <a href=\"http:\/\/www.cscs.ch\" target=\"_blank\">Swiss Center for Scientific Computing (CSCS)<\/a> in Luzern 2011. Prämiert mit dem Publikumspreis.";
    paper.htmlContentDe += "                    <\/p>";
    paper.htmlContentDe += "                <\/div>";
    paper.htmlContentDe += "            <\/div>";
    paper.htmlContentDe += "        <\/div>";



    paper.getHtmlContent = function(lang) {
        switch (lang) {
            case 'de':
                return paper.htmlContentDe;
                break;
            default:
                return paper.htmlContentEn;
        }
    }

    // these fix the Heisenbug!!!
    paperMesh.geometry.computeVertexNormals();
    paperMesh.geometry.computeMorphNormals();

    paper.urlName = "graphics";
    return paper;

}