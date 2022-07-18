## Ontologies used in DISK

DISK uses several ontologies to represent core concepts about hypothesis-driven discoveries, shown in the following diagram:

![Disk Ontologies](../../figures/DISK-ontologies.png "DISK Ontologies")

 - **Community ontologies (shown in blue):** Widely-used community standards to represent basic entities such as people, provenance, and files. These ontologies are the core vocabulary used to store general metadata on DISK.

 - **Core DISK ontologies (shown in green):** Internal ontologies that represent core knowledge structures in DISK, such as:

    - **DISK Ontology:** Basic DISK definitions such as *Hypothesis* and *Line of inquiry*. [More information here](http://disk-project.org/ontology/disk#).

    - **DISK Hypothesis Ontology:** Basic properties to define general hypothesis. [More information here](http://disk-project.org/ontology/hypothesis#).
 
    - **Question Template Ontology:** Ontology to represent questions. [More information here](./question-ontology.md).

 - **Imported Ontologies (shown in yellow):** Imported ontologies. Categorized on three types:

    - Data Ontologies: Each data repository used in DISK has to provide an ontology of its metadata concepts. This ontology is specified as part of [Data Adapters](/data-adapter).

    - Workflow System Ontologies: Each workflow system used in DISK has to provide an ontology of its workflow concepts.  This ontology is a key aspect of [Method Adapters](/method-adapter).

    - Domain Ontologies: These are ontologies that are used to state hypotheses and questions.  They are domain specific.
