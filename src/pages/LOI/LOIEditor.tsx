import React, { Fragment } from "react";
import { Box, Button, Card, Checkbox, Divider, FormControlLabel, FormGroup, FormHelperText, IconButton, MenuItem, Select, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { DataEndpoint, idPattern, LineOfInquiry, Question, QuestionVariable, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch } from "redux/hooks";
import { QuestionLinker } from "components/questions/QuestionLinker";
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { WorkflowList } from "components/methods/WorkflowList";
import { QueryTester } from "components/QueryTester";
import { renderDescription } from "DISK/util";
import { useGetEndpointsQuery } from "redux/apis/server";
import { useGetLOIByIdQuery, usePostLOIMutation, usePutLOIMutation } from "redux/apis/lois";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { alignWorkflow, createQueryForGraph, getAllQuestionVariables, getCompleteQuestionGraph } from "components/questions/QuestionHelpers";
import { TypographySubtitle, TypographySection, TextFieldBlock, FieldBox } from "components/Styles";
import CancelIcon from '@mui/icons-material/Cancel';
import { EditableHeader, TriggerConditionEditor } from "components/Fields";

export const LOIEditor = () => {
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams]= useSearchParams();
    let initQuestion = searchParams.get("q");

    const { loiId } = useParams();
    const selectedId = loiId as string;

    const {data:LOI, isLoading:loading, isError:error} = useGetLOIByIdQuery(selectedId, {skip:!selectedId});
    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    const [postLOI, { isLoading: isCreating }] = usePostLOIMutation();
    const [putLOI, { isLoading: isUpdating }] = usePutLOIMutation();

    const [sparqlVariableNames, setSparqlVariableNames] = React.useState<string[]>([]);
    const [sparqlVariableOptions, setSparqlVariableOptions] = React.useState<string[]>([]);
    const [editingWorkflows, setEditingWorkflows] = React.useState<boolean>(false);

    //FORM
    const [selectedDataSource, setSelectedDataSource] = React.useState("");
    const [dataSourceDescription, setDataSourceDescription] = React.useState("");
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [dataQuery, setDataQuery] = React.useState("");
    const [tableExplanation, setTableDescription] = React.useState("");
    const [tableVariables, setTableVariables] = React.useState("");
    const [dataQueryExplanation, setDataQueryExplanation] = React.useState("");
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [metaWorkflows, setMetaWorkflows] = React.useState<Workflow[]>([]);
    const [questionId, setQuestionId] = React.useState<string>("");
    const [hypothesisQuery, setHypothesisQuery] = React.useState<string>("");
    const [updateCondition, setUpdateCondition] = React.useState<number>(1);

    // State errors...
    const [errorName, setErrorName] = React.useState<boolean>(false);
    const [errorDesc, setErrorDesc] = React.useState<boolean>(false);
    const [errorDataSource, setErrorDataSource] = React.useState<boolean>(false);
    const [errorQuery, setErrorQuery] = React.useState<boolean>(false);
    const [errorQuestion, setErrorQuestion] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }
    const onDataSourceChange = (ds:string) => { setSelectedDataSource(ds); setErrorDataSource(ds.length === 0); }

    useEffect(() => {
        let candidates : Set<string> = new Set<string>();
        sparqlVariableNames.forEach((varName:string) => candidates.add(varName));
        let dataVars : RegExpMatchArray | null = dataQuery.match(/\?[\w\d]+/g);
        if (dataVars) {
            dataVars.forEach((varName:string) => candidates.add(varName));
        }
        setSparqlVariableOptions(Array.from(candidates));
    }, [sparqlVariableNames, dataQuery]);

    useEffect(() => {
        if (selectedDataSource && !!endpoints) {
            for (let i = 0; i < endpoints.length; i++) {
                let ds : DataEndpoint = endpoints[i];
                if (selectedDataSource === ds.url) {
                    setDataSourceDescription(ds.description);
                }
            }
        }
    }, [selectedDataSource, endpoints])
    
    useEffect(() => {
        if (LOI) {
            loadForm(LOI);
        } else {
            clearForm();
        }
    }, [LOI]);// eslint-disable-line react-hooks/exhaustive-deps

    const loadForm = (loi:LineOfInquiry) => {
        setName(loi.name);
        setDescription(loi.description);
        setNotes(loi.notes ? loi.notes : "");
        setSelectedDataSource(loi.dataSource);
        setDataQuery(loi.dataQuery);
        setTableDescription(loi.tableDescription? loi.tableDescription : "");
        setTableVariables(loi.tableVariables? loi.tableVariables : "");
        setDataQueryExplanation(loi.dataQueryExplanation ? loi.dataQueryExplanation : "");
        setWorkflows(loi.workflows);
        setMetaWorkflows(loi.metaWorkflows ? loi.metaWorkflows : []);
        setUpdateCondition(loi.updateCondition ? loi.updateCondition : 1);
    };

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setSelectedDataSource("");
        setDataQuery("");
        setTableDescription("");
        setTableVariables("");
        setDataQueryExplanation("");
        setWorkflows([]);
        setMetaWorkflows([]);
        setUpdateCondition(1);
    };

    const onSaveButtonClicked = () => {
        if (!name || !description || !selectedDataSource || !dataQuery || !questionId) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            if (!selectedDataSource) setErrorDataSource(true);
            if (!dataQuery) setErrorQuery(true);
            if (!questionId) setErrorQuestion(true);
            return;
        }

        let newLOI : LineOfInquiry;
        let previous : any = {};
        let editing : boolean = false;
        if (LOI) {
            // Edit existing hypothesis:
            previous  = { ...LOI };
            editing = true;
        }
        newLOI = {
            ...previous,
            name: name,
            description: description,
            notes: notes,
            questionId: questionId,
            dataQuery: dataQuery,
            hypothesisQuery: hypothesisQuery,
            dataSource: selectedDataSource,
            workflows: workflows.map(alignWorkflow),
            metaWorkflows: metaWorkflows.map(alignWorkflow),
            tableDescription: tableExplanation,
            tableVariables: tableVariables,
            dataQueryExplanation: dataQueryExplanation,
            updateCondition: updateCondition
        };

        dispatch(openBackdrop());
        console.log("SEND:", newLOI);
        (editing?putLOI:postLOI)({data:newLOI as LineOfInquiry})
            .then((data : {data:LineOfInquiry} | {error: any}) => {
                let savedLOI = (data as {data:LineOfInquiry}).data;
                if (savedLOI) {
                    console.log("RETURNED:", savedLOI);
                    navigate(PATH_LOIS + "/" + savedLOI.id.replace(idPattern, "")); 
                    dispatch(openNotification({severity:'success', text:'Line of Inquiry successfully saved'}));
                }
            })
            .catch((e:any) => {
                dispatch(openNotification({severity:'error', text:'Error saving Line of Inquiry'}));
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop());
            });
    };

    const onDuplicateClicked = () => {
        if (!LOI) {
            return;
        }
        let newLOI : LineOfInquiry = { 
            ...LOI,
            id: '',
            name: LOI.name + " (copy)"
        };

        dispatch(openBackdrop())
        postLOI({data:newLOI})
            .then((data : {data:LineOfInquiry} | {error: any}) => {
                let savedLOI = (data as {data:LineOfInquiry}).data;
                if (savedLOI) {
                    console.log("RETURNED:", savedLOI);
                    navigate(PATH_LOIS + "/" + savedLOI.id.replace(idPattern, "")); 
                    dispatch(openNotification({severity:'success', text:'Line of Inquiry successfully saved'}));
                }
            })
            .catch((e) => {
                dispatch(openNotification({severity:'error', text:'Error saving Line of Inquiry'}));
                console.warn(e);
            })
            .finally(() => {
                dispatch(closeBackdrop())
            });
    };

    const onWorkflowListChange = (wfs:Workflow[], metaWfs:Workflow[]) => {
        setWorkflows(wfs);
        setMetaWorkflows(metaWfs);
    };

    const onQuestionChange = (q:Question|null, vars:string[]) => {
        setSparqlVariableNames(vars);
        setQuestionId(q ? q.id : "");
        setErrorQuestion(q === null || q.id.length ===0);
        if (q!=null) {
            let allVars = getAllQuestionVariables(q).reduce((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
            }, {} as {[uri:string]:QuestionVariable});
            setHypothesisQuery(createQueryForGraph(getCompleteQuestionGraph(q), allVars));
        } else {
            setHypothesisQuery("");
        }
    }

    return <Card variant="outlined">
        <EditableHeader loading={loading} value={name} error={errorName} onChange={onNameChange} redirect={PATH_LOIS + (LOI ? "/" + LOI.id : "")}/>
        <Divider/>

        <FieldBox>
            <TypographySubtitle>Description:</TypographySubtitle>
            {loading ? <Skeleton/> :
                <TextFieldBlock multiline fullWidth required size="small" id="LOIDescription" label="Brief description"
                    value={description} error={errorDesc} onChange={(e) => onDescChange(e.target.value)}/>}
            {loading ?  <Skeleton/> :
                <TextFieldBlock multiline fullWidth size="small" id="LOINotes" label="Additional notes"
                    value={notes} onChange={(e) => setNotes(e.target.value)}/>}
            <TriggerConditionEditor defaultValue={LOI ? LOI.updateCondition : 1} onChange={setUpdateCondition}/>
        </FieldBox>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Hypothesis or question template:</TypographySubtitle>
            <QuestionLinker selected={initQuestion ? initQuestion : (LOI? LOI.questionId : "")} onQuestionChange={onQuestionChange} error={errorQuestion}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data:</TypographySubtitle>
            <TextFieldBlock fullWidth size="small" id="LOIQueryExplanation" label="Write an explanation for your data query:" value={dataQueryExplanation} onChange={(e) => setDataQueryExplanation(e.target.value)}/>

            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <TypographySection>Data query:</TypographySection>
                <QueryTester initSource={selectedDataSource} initQuery={dataQuery}/>
            </Box>
            <Box sx={{display: "flex", alignItems: "end"}}>
                {loadingEndpoints ?  <Skeleton sx={{display:"inline-block"}}/> :
                    <Box>
                        <Box sx={{display: "inline", marginRight: "10px", fontWeight: 'bold', }}>Data source:</Box>
                        <Select size="small" sx={{display: 'inline-block', minWidth: "150px", marginRight: '10px'}} variant="standard"  label={"Data source:"} required
                                error={errorDataSource} value={selectedDataSource} onChange={(e) => onDataSourceChange(e.target.value)}>
                            <MenuItem value="" disabled> None </MenuItem>
                            {(endpoints||[]).map((endpoint:DataEndpoint) => 
                                <MenuItem key={`endpoint_${endpoint.name}`} value={endpoint.url}>
                                    {endpoint.name}
                                </MenuItem>)
                            }
                        </Select>
                        {renderDescription(dataSourceDescription)}
                    </Box>
                }
            </Box>
            <Box sx={{fontSize: "0.94rem"}} >
                <Card variant="outlined" sx={{
                        ...{mt: "8px", p: "0px", position: "relative", overflow:"visible", pt:"10px"},
                        ...(errorQuery ? {borderColor:"#d32f2f", } : {})
                    }}>
                    <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-19px 0 0 10px', color:(errorQuery?"#d32f2f":'rgba(0, 0, 0, 0.6);')}}>
                        Data query *
                    </FormHelperText>
                    <CodeMirror value={dataQuery}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                            setDataQuery(value);
                            setErrorQuery(value.length === 0);
                            console.log('value:', value);
                        }}
                    />
                </Card>
            </Box>
            <Box>
                <TypographySection>Input data retrieved:</TypographySection>
                <FormHelperText sx={{fontSize: ".9rem"}}>
                    When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
                </FormHelperText>
                <TextFieldBlock fullWidth size="small" id="LOITableVars" label="Columns to show on table:" placeholder="?var1 ?var2 ..." value={tableVariables} onChange={(e) => setTableVariables(e.target.value)}/>
                <TextFieldBlock fullWidth size="small" id="LOITableDesc" label="Brief description of the table:" value={tableExplanation} onChange={(e) => setTableDescription(e.target.value)}/>
            </Box>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            <WorkflowList editable={true} workflows={workflows} metaworkflows={metaWorkflows} options={sparqlVariableOptions}
                    onEditStateChange={setEditingWorkflows} onChange={onWorkflowListChange}></WorkflowList>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between', padding: "10px"}}>
            {LOI?
                <Button color="info" sx={{mr:"10px"}} onClick={onDuplicateClicked}>
                    <CopyIcon/> Duplicate
                </Button> : <Box/>
            }
            <Box>
                <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_LOIS + (LOI ? "/" + LOI.id : "")}>
                    <CancelIcon/> Cancel
                </Button>
                <Button variant="contained" color="success" onClick={onSaveButtonClicked} disabled={editingWorkflows}>
                    <SaveIcon/> Save
                </Button>
            </Box>
        </Box>
    </Card>
}