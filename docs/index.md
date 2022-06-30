# DISK User guide

## Introduction 

The DISK system automates the execution of scientific workflows triggered on data changes.
To do this DISK collects data from different data repositories and defines methods on different workflows systems.
User defined goals are periodically check for new data/methods available. When a method detects new data, a new workflow execution will be send.
Each experiment execution is stored with its metadata and outputs for posterior analysis.

---

The DISK system defines several resources necessary for its operation. Some of them are:

 - **Hypotheses:** RDF representation of an user goal. UI helpers such as the hypothesis [question template ontology](/question-ontology) can be used to help users on their creation.

 - **Line of Inquiry:** (LOI) represents *how* an experiment will be run. Defines which hypothesis can trigger it, which data and from whom datasource get and which method will create new workflows executions on the workflow system.

 - **Triggered Line of Inquiry:** (TLOI) represents the execution of an experiment defined on a LOI. Stores all used inputs and generated outputs, along with provenance metadata.

For a complete list of the DISK resources and their operation please check the [DISK resources section](/resources).

Users can add **Hypotheses** that will be tested over a list of **Lines of Inquiries** generating a set of new **Triggered Line of Inquiries**. This interaction is summarized on the following diagram:

![Disk overview](figures/DISK-overview.png "DISK Overview")

## Usage

### Writing Semantic hypothesis (Goals)

The disk system stores hypotheses as semantic graphs (RDF).
This representation allow us to register any kind of information and can be extended with the use of external ontologies.

For example, a simple hypothesis like *is A associated with B* is stored as `:A hypothesis:associatedWith :B`.
In this case we are creating two resources that this hypothesis will use (`:A` and `:B`) and linked them together with `associatedWith` from the DISK-Hypothesis ontology.

We could specify the type of each resource to better match the available LOIs:

```
:A hypothesis:associatedWith :B .
:A rdf:type ont:someType .
:B rdf:type ont:otherType .
```

As we can see, this approach can be extended to represent any kind of information with the use of different ontologies.
The main tradeoff is the difficulty of creating such semantic graphs.

To make this process easier we have created the Question Template Ontology and some UI helpers.
You can read an explanation of how this kind of hypothesis are generated [here](/question-ontology) and see a complete list of the ontologies DISK uses [here](/ontology).

### Obtaining data

DISK can obtain data from different data repositories.
Each LOI defines a *data query template*.
When a TLOI is created, this template is filled with parameters obtained from the hypothesis, creating a *data query*.
A *data query* can be executed on multiples data repositories, as long a [data adapter](/data-adapter) is written to suport it.

The current implementation queries for data using `SPARQL` as query language.

### Running workflows

DISK can execute workflows on different workflows systems as long as a [method adapter](/method-adapter) is available.
Each LOI defines how any parameters and data obtained as result of the *data query* will be used when creating one or more workflow executions.
The outputs and metadata generated on this process is stored as a TLOI.

Aditionally, A LOI can define a meta workflow to run using as input the result of the workflow executions.

## Implementations

### NeuroDISK

There is abundant brain image and genetic data for researchers to understand brain structure, functions and disease.
It is challenging to carry out comprehensive analyses that integrate available data.
Though data generation is continuous, analyses are seldom repeated and their results updated. 

The NeuroDISK project automates the analysis of neuroscience data through artificial intelligence (AI).
NeuroDISK is an AI-driven discovery engine that will continually processes neuroscience data.
We use ontologies of hypotheses to represent science driving questions, semantic representations to reason about the data available, machine learning to improve accuracy, and intelligent workflows to customize the analysis to the data.
Given a science question, NeuroDISK autonomously determines what data is needed, triggers the execution of relevant families of workflows, customize them to the data at hand, and alert users of interesting findings.

We are developing NeuroDISK in collaboration with researchers from the ENIGMA consortium who study different neuroscience questions.

This project uses Semantic Media Wikis as data repository and WINGS as Workflow system.