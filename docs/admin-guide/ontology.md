# Ontologies Overview

The DISK system uses several ontologies to store and produce data.

The following diagram shows the ontologies used on the DISK system.

![Disk Ontologies](../figures/DISK-ontologies.png "DISK Ontologies")

 - **On blue:** Commonly used ontologies. These ontologies contribute the vocabulary used to store metadata on the DISK system.

 - **On yellow:** Imported ontologies. Categorized on three types:

    - Ontologies to interact with data repositories. Defined as part of [Data Adapters](/data-adapter)

    - Ontologies to intercat with workflows systems. Defined as part of [Method Adapters](/method-adapter)

    - Ontologies imported to help on the creation of *hypotheses* and *data queries*. Domain specific.

 - **On green:** Internal ontologies created for DISK:

    - **DISK Core:** Basic DISK definitions, such as *Hypothesis*, *Line of inquiry* and so on.
    Please check the [Disk vocabulary](http://disk-project.org/ontology/disk#) for more information.

    - **DISK Hypothesis:** Basic properties to define general hypothesis. Contains terms as `associatedWith` and so on.
    Please check the [hypothesis vocabulary](http://disk-project.org/ontology/hypothesis#) for more information.
 
    - **Question Template:** Ontology to help on the creation of hypothesis, defines *Hypothesis Questions* and how to customize them. [More info here](/question-ontology).

## DISK Ontologies

You can read a detailed explanation of the ENIGMA ontologies on their [documentation page](https://knowledgecaptureanddiscovery.github.io/EnigmaOntology/release/)

The DISK ontologies aims to help scientists to test and discover new hypothesis from existing datasets.
Scientists define lines of inquiry that represent generic research questions, like the proteins associated to a type of cancer.
The lines of inquiry may have multiple hypothesis associated to them, which define a particular instance or aspect of the line of inquiry (e.g., the EGFR protein is associated to colon cancer).
Each hypothesis is represented as a connected graph, where the nodes are the different terms that compose the hypothesis and the edges represent the relationships among those terms.

Each of the statements represented in the hypothesis graph can be supported by the results obtained after running an experiment. In fact, the hypothesis has a confidence value, which varies depending on the results of the experiments run to test it. 