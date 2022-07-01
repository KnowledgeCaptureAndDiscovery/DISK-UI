
## NeuroDISK


There is abundant brain image and genetic data for researchers to understand brain structure, functions and disease.
It is challenging to carry out comprehensive analyses that integrate available data.
Though data generation is continuous, analyses are seldom repeated and their results updated. 

The NeuroDISK project automates the analysis of neuroscience data through artificial intelligence (AI).
NeuroDISK is an AI-driven discovery engine that will continually processes neuroscience data.
We use ontologies of hypotheses to represent science driving questions, semantic representations to reason about the data available, machine learning to improve accuracy, and intelligent workflows to customize the analysis to the data.
Given a science question, NeuroDISK autonomously determines what data is needed, triggers the execution of relevant families of workflows, customize them to the data at hand, and alert users of interesting findings.

We are developing NeuroDISK in collaboration with researchers from the ENIGMA consortium who study different neuroscience questions.

This project uses Semantic Media Wikis as data repository and WINGS as Workflow system.

### Ontologies

You can read a detailed explanation of the ENIGMA ontologies on their [documentation page](https://knowledgecaptureanddiscovery.github.io/EnigmaOntology/release/)

The DISK ontologies aims to help scientists to test and discover new hypothesis from existing datasets.
Scientists define lines of inquiry that represent generic research questions, like the proteins associated to a type of cancer.
The lines of inquiry may have multiple hypothesis associated to them, which define a particular instance or aspect of the line of inquiry (e.g., the EGFR protein is associated to colon cancer).
Each hypothesis is represented as a connected graph, where the nodes are the different terms that compose the hypothesis and the edges represent the relationships among those terms.

Each of the statements represented in the hypothesis graph can be supported by the results obtained after running an experiment. In fact, the hypothesis has a confidence value, which varies depending on the results of the experiments run to test it. 