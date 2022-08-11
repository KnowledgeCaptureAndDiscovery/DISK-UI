
# Specifying Workflows and Meta-Workflows

When an LOI is edited then a list of possible workflows will be shown and you can choose one

To specify the workflow of the LOI, you need to select the button **Add Workflow** and select the workflow from the list of workflows.


![Workflow](../../figures/select-workflow.png "Select workflow")


## Passing Data to the Workflow
 
When you select a workflow, DISK displays the Workflow Inputs required to run.

For example, the following workflow requires the inputs to run:

- `?WeatherSensorCsvFile` a CSV file or multiple CSV files containing the weather data
- `?WeatherVariable1`,`?WeatherVariable2`,`?WeatherVariable3` the names of the weather variables to be used in the workflow. (e.g. temperature, wind speed or precipitation)

![Workflow](../../figures/bikes/loi/method-workflow-empty.png "Select workflow")


Next, you need to specify the values for the Workflow Inputs. To do that, click on one of the Workflow Inputs and select the Data Query or Hypothesis variable from the list displayed.

!!! info
        The Data Query variables are obtained from the data query response and the question template.

For example, we select the following options:

- Hypothesis variable`?WeatherSensor1` to pass as the value for the `?WeatherSensor1` Workflow Input.
- Hypothesis variable `?WeatherSensor2` to pass as the value for the `?WeatherSensor2` Workflow Input.
- Hypothesis variable `?WeatherSensor3` to pass as the value for the `?WeatherSensor3` Workflow Input.
- Data Query variable `?WeatherRecordCsvFile` to pass as the value for the `?WeatherCsvFile` Workflow Input. Also, we select the option called **Multiple** because the Data Query or Hypothesis variable `?url` can be a CSV file or multiple CSV files.

![Workflow](../../figures/bikes/loi/method-workflow-selected.png"Workflow Variables")

You can also add a **Meta-Workflow** to the workflow.  A **Meta-Workflow** is a workflow that is executed after the main workflow. 

### Saving

Remember to save the Line of Inquiry.

## Next steps

You can test the LOI by creating a new Hypothesis and selecting the LOI. [See the previous section details](/advanced-user-guide/steps/write-query).
