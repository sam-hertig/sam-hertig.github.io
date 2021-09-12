function createMolecules(popupDiv) {

	// parameters:
	var darkMat = new THREE.MeshLambertMaterial( { color: 0x403026} );
    var mediumMat = new THREE.MeshLambertMaterial( { color: 0x3c3f2d} );
    var lightMat = new THREE.MeshLambertMaterial( { color: 0x826c57} );
    var x = -15, y = -15;

    // oxygens:
    var o = new THREE.SphereGeometry(1.5, 32, 32);
    var o1Mesh = new THREE.Mesh(o, darkMat);
    var o2Mesh = o1Mesh.clone();

    // O2 doublebond:
    var doubleBond = new THREE.CylinderGeometry(0.3, 0.3, 2, 16, 1, true);
    var db1Mesh = new THREE.Mesh(doubleBond, lightMat);
    var db2Mesh = db1Mesh.clone();

    // hydrogens:
    var h = new THREE.SphereGeometry(1.25, 32, 32);
    var h1Mesh = new THREE.Mesh(h, mediumMat);
    var h2Mesh = h1Mesh.clone();
    var h3Mesh = h1Mesh.clone();
    var h4Mesh = h1Mesh.clone();

    // H single bonds:
    var singleBond = new THREE.CylinderGeometry(0.3, 0.3, 1.75, 16, 1, true);
    var sb1Mesh = new THREE.Mesh(singleBond, lightMat);        
    var sb2Mesh = sb1Mesh.clone();
    
    // parent:
    var mols = new THREE.Object3D();
    mols.add(o1Mesh, o2Mesh, db1Mesh, db2Mesh, h1Mesh, h2Mesh, h3Mesh, h4Mesh, sb1Mesh, sb2Mesh);

    // enable shadows:
    for (i=0; i<mols.children.length; i++) {
        mols.children[i].castShadow = true;
        mols.children[i].receiveShadow = true;
    }

    // dummy item to improve selectbility (for touch devices):
    var box = new THREE.BoxGeometry(9, 16, 4);
    var boxMat = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.0});
    var boxMesh = new THREE.Mesh(box, boxMat);
    boxMesh.position.y = 6;
    boxMesh.position.x = 3;
    boxMesh.position.z = 2;
    mols.add(boxMesh);

    // animation:
    mols.animate = function(t) {
        var focus = false;
        var targetConfig;
        var currentConfig = {
            o1MeshX : o1Mesh.position.x,
            o1MeshY : o1Mesh.position.y,
            o1MeshZ: o1Mesh.position.z,
            o2MeshX : o2Mesh.position.x,
            o2MeshY : o2Mesh.position.y,
            o2MeshZ: o2Mesh.position.z,
            db1MeshX : db1Mesh.position.x,
            db1MeshY : db1Mesh.position.y,
            db1MeshZ: db1Mesh.position.z,
            db1MeshRotZ: db1Mesh.rotation.z,
            db2MeshX : db2Mesh.position.x,
            db2MeshY : db2Mesh.position.y,
            db2MeshZ: db2Mesh.position.z,
            db2MeshRotZ: db2Mesh.rotation.z,
            h1MeshX : h1Mesh.position.x,
            h1MeshY : h1Mesh.position.y,
            h1MeshZ: h1Mesh.position.z,
            h2MeshX : h2Mesh.position.x,
            h2MeshY : h2Mesh.position.y,
            h2MeshZ: h2Mesh.position.z,
            h3MeshX : h3Mesh.position.x,
            h3MeshY : h3Mesh.position.y,
            h3MeshZ: h3Mesh.position.z,
            h4MeshX : h4Mesh.position.x,
            h4MeshY : h4Mesh.position.y,
            h4MeshZ: h4Mesh.position.z,
            sb1MeshX : sb1Mesh.position.x,
            sb1MeshY : sb1Mesh.position.y,
            sb1MeshZ: sb1Mesh.position.z,
            sb1MeshRotZ: sb1Mesh.rotation.z,
            sb2MeshX : sb2Mesh.position.x,
            sb2MeshY : sb2Mesh.position.y,
            sb2MeshZ: sb2Mesh.position.z,
            sb2MeshRotZ: sb2Mesh.rotation.z,
            sysX : mols.position.x,
            sysY : mols.position.y, 
            sysZ : mols.position.z, 
            sysRotX : mols.rotation.x, 
            sysRotY : mols.rotation.y, 
            sysRotZ : mols.rotation.z,
        };
        var initConfig = {
            o1MeshX : 0,
            o1MeshY : 0,
            o1MeshZ: 1.5,
            o2MeshX : 4.5,
            o2MeshY : 0,
            o2MeshZ: 1.5,
            db1MeshX : 2.2,
            db1MeshY : 0.5,
            db1MeshZ: 1.5,
            db1MeshRotZ: Math.PI/2,
            db2MeshX : 2.2,
            db2MeshY : -0.3,
            db2MeshZ: 1.5,        
            db2MeshRotZ: Math.PI/2,
            h1MeshX : -0.5+3, 
            h1MeshY : 5,
            h1MeshZ: 1.25,
            h2MeshX : 2.5+3,
            h2MeshY : 6,
            h2MeshZ: 1.25,
            h3MeshX : 2, 
            h3MeshY : 13, 
            h3MeshZ: 1.25,
            h4MeshX : 3.25,
            h4MeshY : 10,
            h4MeshZ: 1.25,
            sb1MeshX : 4, 
            sb1MeshY : 5.65,
            sb1MeshZ: 1.25,
            sb1MeshRotZ: 0.61*Math.PI, 
            sb2MeshX : 2.8, 
            sb2MeshY : 11.5, 
            sb2MeshZ: 1.25,        
            sb2MeshRotZ: 0.13*Math.PI,
            sysX : x,
            sysY : y,
            sysZ : 0,
            sysRotX : 0,
            sysRotY : 0,
            sysRotZ : Math.PI/4,
        };  
        var interConfig = {
            o1MeshX : 0,
            o1MeshY : 0,
            o1MeshZ: 1.5,
            o2MeshX : 4.5,
            o2MeshY : 0,
            o2MeshZ: 1.5,
            db1MeshX : 2.2,
            db1MeshY : 0.5,
            db1MeshZ: 1.5,
            db1MeshRotZ: Math.PI/2,
            db2MeshX : 2.2,
            db2MeshY : -0.3,
            db2MeshZ: 1.5,        
            db2MeshRotZ: Math.PI/2,
            h1MeshX : -0.5+3, 
            h1MeshY : 5, 
            h1MeshZ: 1.25,
            h2MeshX : 2.5+3, 
            h2MeshY : 6,
            h2MeshZ: 1.25,
            h3MeshX : 2, 
            h3MeshY : 13, 
            h3MeshZ: 1.25,
            h4MeshX : 3.25,
            h4MeshY : 10,
            h4MeshZ: 1.25,
            sb1MeshX : 4, 
            sb1MeshY : 5.65, 
            sb1MeshZ: 1.25,
            sb1MeshRotZ: 0.61*Math.PI, 
            sb2MeshX : 2.8, 
            sb2MeshY : 11.5, 
            sb2MeshZ: 1.25,        
            sb2MeshRotZ: 0.13*Math.PI,             
            sysX : x, 
            sysY : y, 
            sysZ : 8, 
            sysRotX : 0, 
            sysRotY : -Math.PI/2,                
            sysRotZ : 0, 
        };
        var finalConfig = {
            o1MeshX : 0,
            o1MeshY : 0,
            o1MeshZ: 0,
            o2MeshX : 10,
            o2MeshY : 0,
            o2MeshZ: 0,
            db1MeshX : 1,
            db1MeshY : 1,
            db1MeshZ: 0,
            db1MeshRotZ: -Math.PI/3,
            db2MeshX : 1,
            db2MeshY : -1,
            db2MeshZ: 0,        
            db2MeshRotZ: Math.PI/3,
            h1MeshX : 2.5,
            h1MeshY : 2,
            h1MeshZ: 0,
            h2MeshX : 2.5,
            h2MeshY : -2,
            h2MeshZ: 0,
            h3MeshX : 7.5,
            h3MeshY : 2,
            h3MeshZ: 0,
            h4MeshX : 7.5,
            h4MeshY : -2,
            h4MeshZ: 0,
            sb1MeshX : 9,
            sb1MeshY : 1,
            sb1MeshZ: 0,
            sb1MeshRotZ: Math.PI/3,
            sb2MeshX : 9,
            sb2MeshY : -1,
            sb2MeshZ: 0,        
            sb2MeshRotZ: -Math.PI/3,
            sysX : x-10, 
            sysY : y, 
            sysZ : 8, 
            sysRotX : 0, 
            sysRotY : -Math.PI/2,                
            sysRotZ : Math.PI/2,
        };
        if (t < 0) {
            t = -t;
            targetConfig = initConfig;
        } else {
            focus = true;
            targetConfig = finalConfig;
        }

        var molTween1 = new TWEEN.Tween(currentConfig).to(interConfig, 2*t);
        var molTween2 = new TWEEN.Tween(currentConfig).to(targetConfig, 3*t);

        var transition = function() {
            o1Mesh.position.x = currentConfig.o1MeshX;
            o1Mesh.position.y = currentConfig.o1MeshY;
            o1Mesh.position.z = currentConfig.o1MeshZ;
            o2Mesh.position.x = currentConfig.o2MeshX;
            o2Mesh.position.y = currentConfig.o2MeshY;
            o2Mesh.position.z = currentConfig.o2MeshZ;
            db1Mesh.position.x = currentConfig.db1MeshX;
            db1Mesh.position.y = currentConfig.db1MeshY;
            db1Mesh.position.z = currentConfig.db1MeshZ;
            db1Mesh.rotation.z = currentConfig.db1MeshRotZ;
            db2Mesh.position.x = currentConfig.db2MeshX;
            db2Mesh.position.y = currentConfig.db2MeshY;
            db2Mesh.position.z = currentConfig.db2MeshZ;                       
            db2Mesh.rotation.z = currentConfig.db2MeshRotZ;
            h1Mesh.position.x = currentConfig.h1MeshX;
            h1Mesh.position.y = currentConfig.h1MeshY;
            h1Mesh.position.z = currentConfig.h1MeshZ;
            h2Mesh.position.x = currentConfig.h2MeshX;
            h2Mesh.position.y = currentConfig.h2MeshY;
            h2Mesh.position.z = currentConfig.h2MeshZ;
            h3Mesh.position.x = currentConfig.h3MeshX;
            h3Mesh.position.y = currentConfig.h3MeshY;
            h3Mesh.position.z = currentConfig.h3MeshZ;
            h4Mesh.position.x = currentConfig.h4MeshX;
            h4Mesh.position.y = currentConfig.h4MeshY;
            h4Mesh.position.z = currentConfig.h4MeshZ;
            sb1Mesh.position.x = currentConfig.sb1MeshX;
            sb1Mesh.position.y = currentConfig.sb1MeshY;
            sb1Mesh.position.z = currentConfig.sb1MeshZ;
            sb1Mesh.rotation.z = currentConfig.sb1MeshRotZ;
            sb2Mesh.position.x = currentConfig.sb2MeshX;
            sb2Mesh.position.y = currentConfig.sb2MeshY;
            sb2Mesh.position.z = currentConfig.sb2MeshZ;                       
            sb2Mesh.rotation.z = currentConfig.sb2MeshRotZ;
            mols.position.x = currentConfig.sysX;                     
            mols.position.y = currentConfig.sysY;
            mols.position.z = currentConfig.sysZ;
            mols.rotation.x = currentConfig.sysRotX;
            mols.rotation.y = currentConfig.sysRotY;
            mols.rotation.z = currentConfig.sysRotZ;
        }
        molTween1.onUpdate(transition);
        molTween2.onUpdate(transition);
        if (focus) {
            molTween1.easing(TWEEN.Easing.Quadratic.InOut);
            molTween2.easing(TWEEN.Easing.Elastic.In);
        } else {
            molTween1.easing(TWEEN.Easing.Quadratic.InOut);
            molTween2.easing(TWEEN.Easing.Bounce.Out);
        }
        molTween1.onComplete(function() {
            molTween2.start();
        });    
        molTween1.start();

    }

    // on hover:
    mols.hover = function(t) {
        var targetParams, focus=false;
        var currentParams = {
            posZ : mols.position.z
        }
        var initParams = {
            posZ : 0                   
        };
        var finalParams = {
            posZ : 3                             
        };                
        if (t < 0) {
            targetParams = initParams;
            t = -t;
        } else {
            targetParams = finalParams;
            focus = true;
        }  
        var molsTweenHover = new TWEEN.Tween(currentParams).to(targetParams, t);
        var transition = function() {
            mols.position.z = currentParams.posZ;
        }
        molsTweenHover.onUpdate(transition);
        if (focus) {
            molsTweenHover.easing(TWEEN.Easing.Quadratic.Out);
        } else {
            molsTweenHover.easing(TWEEN.Easing.Back.Out);
        }        
        molsTweenHover.start();
    }

    // intro:
    mols.intro = function(t) {
        var initParams = {
            posZ : 25                   
        };
        var finalParams = {
            posZ : 0                             
        };                 
        var molsTweenIntro = new TWEEN.Tween(initParams).to(finalParams, t);
        var transition = function() {
            mols.position.z = initParams.posZ;
        }
        molsTweenIntro.onUpdate(transition);
        molsTweenIntro.easing(TWEEN.Easing.Back.Out);        
        molsTweenIntro.start();
    }

    // popup text content:

    mols.htmlContentEn = "";
    mols.htmlContentEn += "        <div class=\"row\" style=\"margin-top: 2%\">";
    mols.htmlContentEn += "            <div class=\"twelve columns\">";
    mols.htmlContentEn += "                <h4>";
    mols.htmlContentEn += "                    Interactive";
    mols.htmlContentEn += "                <\/h4>";
    mols.htmlContentEn += "                <p>";
    mols.htmlContentEn += "                    We design interactive visualizations that enable you to present your scientific or technical data to your customers and audience in an immersive and engaging process.";
    mols.htmlContentEn += "                <\/p>";
    mols.htmlContentEn += "            <\/div>";
    mols.htmlContentEn += "        <\/div>";
    mols.htmlContentEn += "        <div class=\"caption\">";
    mols.htmlContentEn += "            <div class=\"row\" style=\"margin-top: 0%\">";
    mols.htmlContentEn += "                <div class=\"four columns\">";
    mols.htmlContentEn += "                    <center>";
    mols.htmlContentEn += "                        <a href=\"https:\/\/www.comerge.net\/en\/work\/swisslog\" class=\"preventzoomout\" target=\"_blank\">";
    mols.htmlContentEn += "                            <img src=\"images\/comergesl.jpg\" class=\"u-max-full-width\" alt=\"Link to Comerge website\">";
    mols.htmlContentEn += "                        <\/a>";
    mols.htmlContentEn += "                    <\/center>    ";
    mols.htmlContentEn += "                    <p class=\"preventzoomout\">";
    mols.htmlContentEn += "                        For the Zurich-based software company <a href=\"https:\/\/www.comerge.net\/en\/work\/swisslog\" target=\"_blank\">Comerge,<\/a> we help develop a web-based 3D-visualization app to render and simulate warehouses in real-time using Javascript and the WebGL library <a href=\"https:\/\/threejs.org\" target=\"_blank\">Three.js<\/a>.";
    mols.htmlContentEn += "                    <\/p>";
    mols.htmlContentEn += "                <\/div>  ";
    mols.htmlContentEn += "                <div class=\"four columns\">";
    mols.htmlContentEn += "                    <center>";
    mols.htmlContentEn += "                        <a href=\"cpviewer.html\" class=\"preventzoomout\">";
    mols.htmlContentEn += "                            <img src=\"images\/cellpackthumb.png\" class=\"u-max-full-width\" alt=\"Link to cellPACK viewer\">";
    mols.htmlContentEn += "                        <\/a>";
    mols.htmlContentEn += "                    <\/center>";
    mols.htmlContentEn += "                    <p class=\"preventzoomout\">";
    mols.htmlContentEn += "                        This <a href=\"cpviewer.html\"> prototype of an interactive visualization tool<\/a> was created to explore structural biological data in a web browser. It was designed as the front-end for <a href=\"http:\/\/www.cellpack.org\/\" target=\"_blank\">cellPACK,<\/a> which was developed by <a href=\"https:\/\/www.alleninstitute.org\/what-we-do\/cell-science\/about\/team\/staff-profiles\/graham-johnson\/\" target=\"_blank\">Graham Johnson<\/a> et al.";
    mols.htmlContentEn += "                    <\/p>                ";
    mols.htmlContentEn += "                <\/div>";
    mols.htmlContentEn += "                <div class=\"four columns\">";
    mols.htmlContentEn += "                    <center>";
    mols.htmlContentEn += "                        <a href=\"mda.html\" class=\"preventzoomout\">";
    mols.htmlContentEn += "                            <img src=\"images\/mdathumb.jpg\" class=\"u-max-full-width\" alt=\"Link to MDA page\">";
    mols.htmlContentEn += "                        <\/a>";
    mols.htmlContentEn += "                    <\/center>    ";
    mols.htmlContentEn += "                    <p class=\"preventzoomout\">";
    mols.htmlContentEn += "                     We can simplify your data analysis and visualization pipeline using Python and SQL.<a href=\"mda.html\"> Multidomain Assembler (MDA) <\/a> is an algorithm for modeling and visualizing large multidomain proteins, fully embedded in the molecular graphics software <a href=\"http:\/\/www.cgl.ucsf.edu\/chimera\/\" target=\"_blank\">UCSF Chimera.<\/a>";
    mols.htmlContentEn += "                    <\/p>";
    mols.htmlContentEn += "                <\/div>          ";
    mols.htmlContentEn += "            <\/div>";
    mols.htmlContentEn += "        <\/div>";


    mols.htmlContentDe = "";
    mols.htmlContentDe += "        <div class=\"row\" style=\"margin-top: 2%\">";
    mols.htmlContentDe += "            <div class=\"twelve columns\">";
    mols.htmlContentDe += "                <h4>";
    mols.htmlContentDe += "                    Interaktiv";
    mols.htmlContentDe += "                <\/h4>";
    mols.htmlContentDe += "                <p>";
    mols.htmlContentDe += "                    Wir entwickeln interaktive Visualisierungen, die Erkenntnisse aus Ihren wissenschaftlichen oder technischen Daten Ihrem Zielpublikum eindrücklich und gezielt näherbringen können.";
    mols.htmlContentDe += "                <\/p>";
    mols.htmlContentDe += "            <\/div>";
    mols.htmlContentDe += "        <\/div>";
    mols.htmlContentDe += "        <div class=\"caption\">";
    mols.htmlContentDe += "            <div class=\"row\" style=\"margin-top: 0%\">";
    mols.htmlContentDe += "                <div class=\"four columns\">";
    mols.htmlContentDe += "                    <center>";
    mols.htmlContentDe += "                        <a href=\"https:\/\/www.comerge.net\/referenzen\/swisslog\" class=\"preventzoomout\" target=\"_blank\">";
    mols.htmlContentDe += "                            <img src=\"images\/comergesl.jpg\" class=\"u-max-full-width\" alt=\"Link to Comerge website\">";
    mols.htmlContentDe += "                        <\/a>";
    mols.htmlContentDe += "                    <\/center>    ";
    mols.htmlContentDe += "                    <p class=\"preventzoomout\">";
    mols.htmlContentDe += "                        Für die Firma <a href=\"https:\/\/www.comerge.net\/referenzen\/swisslog\" target=\"_blank\">Comerge<\/a> in Zürich sind wir an der Entwicklung einer web-basierten 3D-Visualisierungs Applikation beteiligt. Diese ermöglicht es, Logistik-Daten von Warenhäusern in Echtzeit darzustellen und zu simulieren, mittels JavaScript und der WebGL-Bibliothek <a href=\"https:\/\/threejs.org\" target=\"_blank\">Three.js<\/a>.";
    mols.htmlContentDe += "                    <\/p>";
    mols.htmlContentDe += "                <\/div>  ";
    mols.htmlContentDe += "                <div class=\"four columns\">";
    mols.htmlContentDe += "                    <center>";
    mols.htmlContentDe += "                        <a href=\"cpviewerDE.html\" class=\"preventzoomout\">";
    mols.htmlContentDe += "                            <img src=\"images\/cellpackthumb.png\" class=\"u-max-full-width\" alt=\"Link to cellPACK viewer\">";
    mols.htmlContentDe += "                        <\/a>";
    mols.htmlContentDe += "                    <\/center>";
    mols.htmlContentDe += "                    <p class=\"preventzoomout\">";
    mols.htmlContentDe += "                        Dieser <a href=\"cpviewer.html\"> Prototyp eines interaktiven Visualisierungs-Tools <\/a>wurde kreiert um biologische Strukturdaten in einem Web-Browser darstellen zu können. Geplant als Frontend-Komponente für die Software <a href=\"http:\/\/www.cellpack.org\/\" target=\"_blank\">cellPACK,<\/a> welche von <a href=\"https:\/\/www.alleninstitute.org\/what-we-do\/cell-science\/about\/team\/staff-profiles\/graham-johnson\/\" target=\"_blank\">Graham Johnson<\/a> et al. entwickelt wurde.";
    mols.htmlContentDe += "                    <\/p>                ";
    mols.htmlContentDe += "                <\/div>";
    mols.htmlContentDe += "                <div class=\"four columns\">";
    mols.htmlContentDe += "                    <center>";
    mols.htmlContentDe += "                        <a href=\"mdaDE.html\" class=\"preventzoomout\">";
    mols.htmlContentDe += "                            <img src=\"images\/mdathumb.jpg\" class=\"u-max-full-width\" alt=\"Link to MDA page\">";
    mols.htmlContentDe += "                        <\/a>";
    mols.htmlContentDe += "                    <\/center>    ";
    mols.htmlContentDe += "                    <p class=\"preventzoomout\">";
    mols.htmlContentDe += "                        Wir können Datenanalyse und Datenvisualisierungs-Prozesse mit Python und SQL vereinfachen, wie mit dem <a href=\"mda.html\">Multidomain Assembler (MDA)<\/a>, einem Algorithmus zur Modellierung und Visualisierung für Proteine, integriert in der Molekulargrafik-Software <a href=\"http:\/\/www.cgl.ucsf.edu\/chimera\/\" target=\"_blank\">UCSF Chimera.<\/a>";
    mols.htmlContentDe += "                    <\/p>";
    mols.htmlContentDe += "                <\/div>          ";
    mols.htmlContentDe += "            <\/div>";
    mols.htmlContentDe += "        <\/div>";



    mols.getHtmlContent = function(lang) {
        switch (lang) {
            case 'de':
                return mols.htmlContentDe;
                break;
            default:
                return mols.htmlContentEn;
        }
    }    


    // set intial position of molecules:
    mols.animate(-1);
    
    mols.urlName = "interactive";
    return mols;

}    



