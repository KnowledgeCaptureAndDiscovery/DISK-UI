# DISK Resources

The DISK system defines several resources necessary for its operation. Some of them are:

 - **Hypotheses:** RDF representation of an user goal. UI helpers such as the hypothesis [question template ontology](/question-ontology) can be used to help users on their creation.

 - **Line of Inquiry:** (LOI) represents *how* an experiment will be run. Defines which hypothesis can trigger it, which data and from whom datasource get and which method will create new workflows executions on the workflow system.

 - **Triggered Line of Inquiry:** (TLOI) represents the execution of an experiment defined on a LOI. Stores all used inputs and generated outputs, along with provenance metadata.

For a complete list of the DISK resources and their operation please check the [DISK resources section](/resources).

Users can add **Hypotheses** that will be tested over a list of **Lines of Inquiries** generating a set of new **Triggered Line of Inquiries**. This interaction is summarized on the following diagram:

DISK defines the following resources:

| Resource name | Description |
| ------------- | ----------- |
| Hypothesis | RDF representation of a Goal |
| Line of Inquiry | How to run an experiment. Defines which hypothesis will trigger it, the data query that will run and the method that will trigger  | 
| Triggered Line of Inquiry | An experiment execution. Stores the experiment metadata and outputs |
| Question | Question from the [question template ontology](/question-ontology). Helps users on the Hypothesis creation. |
| Question Variable | Variables that the user can set. Can have restrictions |
| Method | Representation of a workflow on the DISK system. Containts basic information, inputs and outputs |


You can interact with this resources through the [DISK REST API](/rest)