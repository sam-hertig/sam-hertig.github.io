function addText(module) {

	module.storyBoxContents = [

        "The <a href='http://www.sciencemag.org/topic/crispr' target='blank'>CRISPR system</a> (Clustered Regularly Interspaced Short Palindromic Repeats) was first identified in bacteria, where it plays an important role in the immune system. In recent years, molecular biologists have turned the system into a toolbox for genome editing.<br><br>" + 
        "How does a molecular mechanism work that can cut DNA? Two biological macromolecules form the core of the CRISPR system: <a href='http://science.sciencemag.org/content/343/6176/1247997' target='blank' class='cas9'>the CRISPR-associated Protein 9 (Cas9, left)</a>, and <span class='grna'>the guide RNA (gRNA, pink, right)</span>.",

        "Cas9 can be considered as the molecular scissors that cut DNA, and the gRNA serves as the targeting system for Cas9. Inside the cell, the gRNA binds to Cas9 and thus renders Cas9 highly selective for its target DNA. Upon binding, <a href='http://science.sciencemag.org/content/348/6242/1477' target='blank'>Cas9 changes its conformation</a> to accomodate the gRNA, which also converts the inactive protein to its active state.",

        "The Cas9-gRNA complex is now ready to cut the target DNA. Since the target DNA lives in the <a href='https://en.wikipedia.org/wiki/Cell_nucleus' target='blank' class='nucleus'>nucleus</a> of a cell, Cas9 will need to be transported into the nucleus.",

        "Transport into the nucleus occurs via a <a href='http://pdb101.rcsb.org/motm/205' target='blank' class ='nucleus'>nuclear pore complex</a>. If Cas9 (10 nm) was the size of a pair of scissors (10 cm), a nuclear pore complex would be roughly the size of a person, and the entire nucleus would span about half a football field.",

        "Inside the nucleus, Cas9 needs to locate its <span class='dna1'>t</span><span class='dna2'>a</span><span class='dna1'>r</span><span class='dna2'>g</span><span class='dna1'>e</span><span class='dna2'>t</span> <span class='dna1'>D</span><span class='dna2'>N</span><span class='dna1'>A</span>.",

        "This stochastic search starts with Cas9 trying to identify a specific sequence, the PAM-sequence (Protospacer Adjacent Motif), on the target DNA.",

        "The PAM sequence on the target DNA binds to <span class='pamdomain'>the PAM-interacting domain (lilac)</span> on Cas9. Binding of the target DNA to Cas9 is accompanied by <a href='http://science.sciencemag.org/content/351/6275/867' target='blank'>another conformational change in Cas9</a>.",

        "The bases upstream of the PAM-sequence on the DNA are now in close proximity to the gRNA.",

        "If the sequence of <span class='dna1'>the target strand on the DNA</span> is complimentary to <span class='grna'>the gRNA</span>, Cas9 melts the bases of the DNA and the target DNA strand becomes paired with the gRNA.",

        "Proper DNA-gRNA pairing ensures correct positioning of the DNA for cutting.",

        "<span class='dna1'>The target DNA-strand (purple)</span> is cut by amino acids in <span class='hnhdomain'>the HNH domain (salmon) of Cas9</span>, and <span class='dna2'>the non-target DNA strand (blue)</span> is cut by protein residues in <span class='ruvcdomain'>the RuvC-domain (light blue) of Cas9</span>.",

        "The gap in the DNA inactivates the corresponding gene. The system can be extended by a custom host DNA fragment, which will get inserted into the gap and thus added as a new gene. All this can take place in a living cell. <br><br>" +
        "For further resources on the structural basis of the CRISPR/Cas9 system, visit <a href='http://pdb101.rcsb.org/motm/181' target='blank'>the Protein Data Bank.</a> " +
        "Many scientists believe that gene editing is the just <a href='http://www.nature.com/news/crispr-gene-editing-is-just-the-beginning-1.19510' target='blank'>the first step towards harnessing the power of CRISPR.</a>",

	];

	return module;
}