# Testing a New Hypothesis

DISK can test your new hypothesis by triggering a Line of Inquiry (LOI) that matches it.  This will happen automatically, and DISK will show you the results.  But in case you are curious, we show you next how you can browse the Lines of Inquiry defined in DISK.

## Browsing LOIs

To view LOIs associated with a hypothesis template, go to the **Hypothesis** tab. The LOIs are listed under the Hypothesis template that they match.  

!!! Info
    Lines of inquiry are created by Advanced Users who are familiar with advanced features of DISK.

This example shows the LOIs associated with two hypotheses:

![LOI](../figures/user-guide/loi.png "LOI")

## Executing LOIs

You don't have to ask DISK to execute LOIs.  LOIs are executed automatically when you add a new hypothesis or question.

The LOIs that match your new hypothesis will be triggered.  When an LOI is triggered, the following occurs:

 - A data query will be executed to retrieve relevant data
 - One or more workflows will be executed to analyze the data
 - A meta-workflow will be executed to assemble the results of all the workflows 

## Checking Results

When you select an LOI name, you can see all the workflow executions, including their individual results.

In the following image, you can see two workflow executions associated with the LOI. The first one is using 10 input datasets, generating 2 outputs and showing a resulting p-value of 0.838.  The second one is using 56 input datasets, generating 2 outputs and showing a resulting p-value of 0.776.

![LOI](../figures/user-guide/lois.png "LOI")

## Getting the Execution Provenance

All the LOI and workflow executions are recorded in detail.  DISK generates a narrative from those provenance records that explains how the results were obtained.

To display the narrative, you can select the **Narrative** button.

The following image shows the execution narrative for the first LOI, along with a table that summarizes key metadata of the input datasets used.

![Narrative](../figures/user-guide/narrative.png "Narrative")

## Updating the Results

The LOI will be triggered again when new datasets become available in the data source.  DISK will do this automatically.  

You can view the new executions and the updated results.

## Next steps

You can learn more about what Advanced Users can do in DISK.
