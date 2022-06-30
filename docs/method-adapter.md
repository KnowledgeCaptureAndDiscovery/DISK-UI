# Method Adapter

A DISK Method adapter is the implementation of the `MethodAdapter` abstract class (at the end).
This adapters are used to gain control of the workflow system from DISK.

The method adapter must be able to perform at least the following operations:

 - Get a list of methods
 - Send a workflow execution 
 - Monitor workflows

```java
public abstract class MethodAdapter {
    public MethodAdapter () {}
    
    public List<Method> ListMethods ();
    public Method GetMethodInfo (String methodid);
    public boolean RunMethod (Method method);

    // Check that a LOI is correctly configured for this adapter
    public abstract boolean validateLOI (LineOfInquiry loi, Map<String, String> values);
}
```