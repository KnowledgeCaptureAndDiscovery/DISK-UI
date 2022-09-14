# Data Adapter

A [DISK](https://disk.isi.edu) Data adapter is the implementation of the `DataAdapter` abstract class (show at the end).
This adapters are used to add data into the [DISK](https://disk.isi.edu) System.

The data adapter must be able to perform at least the following operations:

 - Process a *data query* and obtain results (files and parameters).
 - Obtain `SPARQL` results to use as options.
 - Get information about files in the repository (hashes, dates, etc).

```java
public abstract class DataAdapter {
    private String endpointUrl, name, username, password, prefix, namespace;

    public DataAdapter (String URI, String name, String username, String password);
    
    public String getEndpointUrl ();
    public String getName ();
    protected String getUsername ();
    protected String getPassword ();

    public void setPrefix (String prefix, String namespace);
    public String getPrefix ();
    public String getNamespace ();
    
    public abstract List<DataResult> query (String queryString);

    //This data query must return two variable names:
    static public String VARURI = "uri";
    static public String VARLABEL = "label";
    public abstract List<DataResult> queryOptions (String varname, String constraintQuery);

    // file -> hash
    public abstract Map<String, String> getFileHashes (List<String> dsurls);

    // Check that a LOI is correctly configured for this adapter
    public abstract boolean validateLOI (LineOfInquiry loi, Map<String, String> values);
}
```