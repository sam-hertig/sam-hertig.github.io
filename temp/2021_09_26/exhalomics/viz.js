const researcherFile = "researchers.csv"
const instituteFile = "institutes.csv"
const maxNrofFields = 20;
const maxWidth = 1000;
const maxHeight = 1800;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const profNameWidth = 260;
const titleSpacerProfs = 40;
const titleSpacerFields = 40;
const spacingVprofs = 20;
const spacingVfields = 20;
const spacingH = 200;
const instituteLegendSpacer = 4;
const width = maxWidth - margin.left - margin.right;
const height = maxHeight - margin.top - margin.bottom;


// Create base SVG
const svg = d3.select("#viz")
   .append("div")
   .classed("svg-container", true)
   .append("svg")
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + width + " " + height)
   .classed("svg-content-responsive", true)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');  


Promise.all([
    d3.csv(instituteFile),
    d3.csv(researcherFile),
]).then(files => {

    const institutes = files[0];
    const instituteNames = institutes.map(i => i["Institute"]);
    const reducer = (accumulator, currentValue) => ({...accumulator, [currentValue["Institute"]]: currentValue["Color"]});
    const instituteColors = institutes.reduce(reducer, {});
    const data = files[1];
    let highlightedProf;


    // Gather field names
    let fields = [];
    const lowerCaseWords = ["And", "The", "Of"];
    data.forEach(d => {
        for (let i=1; i<=maxNrofFields; i++) {
            let field = (d["Field"+i] == undefined) ? "" : d["Field"+i];
            // fix capitalization
            let words = field.split(" ");
            let fixedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            fixedWords = fixedWords.map(word => {
                if(lowerCaseWords.includes(word)) {
                    return word.toLowerCase();
                }
                return word;
            });
            d["Field"+i] = fixedWords.join(" "); ;
            fields.push(d["Field"+i]);
        }
    });


    // Remove duplicates and empty strings, and sort alphabetically
    fields = [...(new Set(fields))]
        .filter(field => field !== '')
        .sort();  


    // Gather coordinates for headers:
    const coords = {};
    coords["RightHeader"] = {
        x: profNameWidth,
        y: 0
    };
    coords["LeftHeader"] = {
        x: profNameWidth+spacingH,
        y: 0
    };


    // Gather coordinates for nodes and edges:
    data.forEach( (d, i) => {
        coords[d["Professor"]] = {
            x: profNameWidth,
            y: spacingVprofs*(i) + titleSpacerProfs
        }

    });
    fields.forEach( (f,j) => {
        coords[f] = {
            x: profNameWidth+spacingH,
            y: spacingVfields*(j) + titleSpacerFields     
        }

    });


    // Gather coordinates for legend:
    const nrOfProfs = data.length;
    const nrOfFields = fields.length;
    instituteNames.forEach((inst, k) => {
        coords[inst] = {
            x: nrOfProfs>nrOfFields ? profNameWidth+spacingH : profNameWidth,
            y: nrOfProfs>nrOfFields ? spacingVfields*(nrOfFields+instituteLegendSpacer+k) : spacingVprofs*(nrOfProfs+instituteLegendSpacer+k)
        };
    });


    // Place headers:
    svg
        .append('g')
        .attr('transform', 'translate(' + coords["RightHeader"].x + ',' + coords["RightHeader"].y + ')')
        .append('text')
        .attr('class', 'header')
        .text('Research Group')
        .attr("text-anchor", "end")
        .attr('transform', d => 'translate(' + (-5) + ',' + 5 + ')')
    svg
        .append('g')        
        .attr('transform', 'translate(' + coords["LeftHeader"].x + ',' + coords["LeftHeader"].y + ')')
        .append('text')
        .attr('class', 'header')
        .text('Research and Technologies')
        .attr('transform', d => 'translate(' + 5 + ',' + 5 + ')');  


    // Gather links with their start- and end-coordinates
    const links = [];
    data.forEach(d => {
        for (let i=1; i<=maxNrofFields; i++) {
            const field = d["Field"+i];
            if (field !== "") {
                links.push({
                    prof: d["Professor"],
                    field: field,
                    start: coords[d["Professor"]],
                    end: coords[field],                    
                });
            }
        }
    });    


    // Add each professor node 
    const profNodes = svg.selectAll(".node-prof")
        .data(data)
        .enter()
        .append('g')
        .attr('transform', d => 'translate(' + coords[d["Professor"]].x + ',' + coords[d["Professor"]].y + ')')
        .append('text')
        .attr('class', 'node-prof')
        .on("mouseover", mouseOverProf)
        .on("click", clickOnProf)
        .attr('transform', d => 'translate(' + (-5) + ',' + 5 + ')')
        .attr("text-anchor", "end")
        .text(d => d["Professor"])
        .style("fill", d => instituteColors[d["Institute"]]);

    function mouseOverProf(event, d) {
        profNodes.classed("node-prof-highlight", false);
        profNodes.classed("node-prof-highlight-linked", false);
        fieldNodes.classed("node-field-highlight", false);
        edges.classed("link-highlight", false);
        profNodes.classed("node-prof-highlight-linked", p => p.Professor === d.Professor);
        edges.filter(e => e.prof === d.Professor)
            .classed("link-highlight", true)
            .raise();
        fieldNodes.filter(f => {
            for (let i=1; i<=maxNrofFields; i++) {
                const field = d["Field"+i];
                if (field === f) {
                    return true;
                }
            }
            return false;
        }).classed("node-field-highlight", true);
        setTimeout(() => highlightedProf = d.Professor, 100); // hack for Android mobile devices
    }

    function clickOnProf(event, d) {
        if (d.Professor != highlightedProf) {
            return;
        }
        const win = window.open(d.Homepage, '_blank');
        win.focus();
    }

        
    // Add each field node 
    const fieldNodes = svg.selectAll(".node-field")
        .data(fields)
        .enter()
        .append('g')
        .attr('class', 'node-field')
        .attr('transform', d => 'translate(' + coords[d].x + ',' + coords[d].y + ')')
        .append('text')
        .on("mouseover", mouseOverField)
        .attr('transform', d => 'translate(' + 5 + ',' + 5 + ')')
        .attr("text-anchor", "start")
        .text(d => d);

    function mouseOverField(event, d) {
        highlightedProf = undefined;
        profNodes.classed("node-prof-highlight", false);
        profNodes.classed("node-prof-highlight-linked", false);
        fieldNodes.classed("node-field-highlight", false);
        edges.classed("link-highlight", false);
        fieldNodes.filter(f => f === d).classed("node-field-highlight", true);   
        edges.filter(e => e.field === d)
            .classed("link-highlight", true)
            .raise();     
        profNodes.filter(p => {
            for (let i=1; i<=maxNrofFields; i++) {
                const field = p["Field"+i];
                if (field === d) {
                    return true;
                }
            }
            return false;
        }).classed("node-prof-highlight", true);
    }        

    // Add each edge
    const edges = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d => {
            return "M" + d.start.x + "," + d.start.y 
                            + "C" + (d.start.x+d.end.x)/2 + "," + d.start.y 
                            + " " + (d.start.x+d.end.x)/2 + "," + d.end.y 
                            + " " + d.end.x + "," + d.end.y 
        }); 


    // Omit legend if only one institute
    if (institutes.length <= 1) {
        return;    
    }


    // Add legend words
    const legendItems = svg.selectAll(".legend")
        .data(instituteNames)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', d => 'translate(' + coords[d].x + ',' + coords[d].y + ')');
        
    legendItems
        .append('circle')
        .attr('transform', d => nrOfProfs>nrOfFields ? 'translate(' + 10 + ',' + 0 + ')' : 'translate(' + (-10) + ',' + 0 + ')')
        .attr('r', 5)
        .attr("fill", d => instituteColors[d]);

    legendItems
        .append('text')
        .attr('transform', d => nrOfProfs>nrOfFields ? 'translate(' + 20 + ',' + 5 + ')' : 'translate(' + (-20) + ',' + 5 + ')')
        .attr("text-anchor", d => nrOfProfs>nrOfFields ? "start" : "end")
        .attr('class', 'institute')
        .text(d => d)
        .on("click", clickOnInstitute)
        .style("fill", d => instituteColors[d]);
  
    function clickOnInstitute(event, d) {
        const institute = institutes.find(i => i["Institute"] == d);
        const instituteLink = institute["Homepage"];
        const win = window.open(instituteLink, '_blank');
        win.focus();        
    }    
});