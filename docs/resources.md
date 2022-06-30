# DISK Resources

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