# Data Adapter

A [DISK](https://disk.isi.edu) Data adapter is the implementation of the `DataAdapter` abstract class (show at the end).
This adapters are used to add data into the [DISK](https://disk.isi.edu) System.

The data adapter must be able to perform at least the following operations:

 - Process a *data query* and obtain results (files and parameters).
 - Obtain `SPARQL` results to use as options.
 - Get information about files in the repository (hashes, dates, etc).


 A simple overview of the abstract class is provided below, you can check code examples on [our repository](https://github.com/KnowledgeCaptureAndDiscovery/DISK-API/blob/main/server/src/main/java/org/diskproject/server/adapters/GraphDBAdapter.java).

```java
public abstract class DataAdapter {
    // Basic endpoint information, getters and setters omitted for simplicity
    private String endpointUrl, name, username, password, prefix, namespace;

    public DataAdapter (String URI, String name);
    public DataAdapter (String URI, String name, String username, String password);

    // Query data to endpoint, return as DataResult or as a csv file as byte[]
    public abstract List<DataResult> query (String queryString) throws Exception;
    public abstract byte[] queryCSV(String queryString) throws Exception;

    // Query for available options for variable varName, this queries URI and (opt) label.
    static public String VARURI = "uri";
    static public String VARLABEL = "label";
    public abstract List<DataResult> queryOptions (String varName, String constraintQuery) throws Exception;

    // Get the hash (or e-tag) of a list of files to check if they have change
    public abstract Map<String, String> getFileHashes (List<String> dsUrls) throws Exception;
    public abstract Map<String, String> getFileHashesByETag(List<String> dsUrls) throws Exception;
}
```