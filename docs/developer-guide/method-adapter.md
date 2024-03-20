# Method Adapter

A [DISK](https://disk.isi.edu) Method adapter is the implementation of the `MethodAdapter` abstract class (shown at the end).
These adapters are used to give [DISK](https://disk.isi.edu) control of the workflow system.

The method adapter must be able to perform at least the following operations:

 - Get a list of methods
 - Get details of parameters
 - Send a workflow execution 
 - Monitor a workflows execution

 Code examples available in [our repository](https://github.com/KnowledgeCaptureAndDiscovery/DISK-API/blob/main/server/src/main/java/org/diskproject/server/adapters/AirFlowAdapter.java).


```java
public abstract class MethodAdapter {
    // Basic endpoint information, getters and setters omitted for simplicity
    private String name, id, endpointUrl, username, password, description;
    private Float version; 

    public MethodAdapter (String adapterName, String url);
    public MethodAdapter (String adapterName, String url, String username, String password);

    // Get workflows and input parameters
	public abstract List<WorkflowTemplate> getWorkflowList();
	public abstract List<WorkflowVariable> getWorkflowVariables(String id);
    // Checks if a list of input files are available for the workflow manager.
	public abstract List<String> areFilesAvailable (Set<String> fileList, String dType);
    // Uploads/register data into the workflow manager
	public abstract String addData (String url, String name, String dType) throws Exception;
    // Runs a workflow
	public abstract List<String> runWorkflow (String wfId, List<VariableBinding> vBindings, Map<String, WorkflowVariable> inputVariables);
	// Monitor workflow
    public abstract Execution getRunStatus (String runId);
    // Download a output file
	public abstract FileAndMeta fetchData (String dataId);
}
```