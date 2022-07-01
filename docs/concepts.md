# DISK Resources

The DISK system defines several resources necessary for its operation. Some of them are:

 - **Hypotheses:** A hypothesis statement, which is a set of assertions about entities in the domain. This statement can be supported or dismissed based on data analysis.
 - **Question:** A represents a type of scientific question to be solved.
 - **Question Variable:**  Identifies a variable within hypothesis question. The value of the variable may be defined by the user or line of inquiry.
 - **Workflow:**  Workflows define the set of computational tasks and dependencies needed to carry out in silico experiments
 - **Method:** Representation of a workflow. 
 - **Line of Inquiry:** (LOI) represents *how* an experiment will be run. Defines which hypothesis can trigger it, which data and from whom data source get and which method will create new workflows executions on the workflow system.
 - **Triggered Line of Inquiry:** (TLOI) represents the execution of an experiment defined on a LOI. Stores all used inputs and generated outputs, along with provenance metadata.

Users can add **Hypotheses** that will be tested over a list of **Lines of Inquiries** generating a set of new **Triggered Line of Inquiries**. This interaction is summarized on the following diagram:


![Disk overview](figures/DISK-overview.png "DISK Overview")
