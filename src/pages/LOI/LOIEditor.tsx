import React, { Fragment } from "react";
import { Box, Button, Card, Checkbox, Divider, FormControlLabel, FormGroup, FormHelperText, IconButton, MenuItem, Select, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { DataEndpoint, idPattern, LineOfInquiry, Question, Workflow } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
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
import { alignWorkflow } from "components/questions/QuestionHelpers";

export const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    margin: "6px 0",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em",
    padding: "5px 5px 0px 5px",
}));

const TypographySection = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.05em"
}));

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
            //TODO: removing optional parameters, this should be handled server side.
            let noOptPattern : string = q.pattern.replace(/optional\s*\{.+\}/g, '').trim();
            // Replace all sub-resources (:example) for variables (?example) for hypothesis matching.
            setHypothesisQuery( noOptPattern.replaceAll(/([\s]|^):([\w\d]+)/g, "$1?$2") );
        } else {
            setHypothesisQuery("");
        }
    }

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)", overflowY: 'auto'}}>
        <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor: "whitesmoke"}}>
            {!loading ? 
                <TextField fullWidth size="small" id="LOIName" label="Short name" required sx={{backgroundColor: "white"}}
                    value={name} error={errorName} onChange={(e) => onNameChange(e.target.value)}/>
            : <Skeleton/> }

            <Tooltip arrow title="Cancel">
                <IconButton component={Link} to={PATH_LOIS + (LOI ? "/" + LOI.id : "")}>
                    <CancelIcon /> 
                </IconButton>
            </Tooltip>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Description:</TypographySubtitle>
            {!loading ?
                <TextFieldBlock multiline fullWidth required size="small" id="LOIDescription" label="Brief description"
                    value={description} error={errorDesc} onChange={(e) => onDescChange(e.target.value)}/>
            : <Skeleton/> }
            {!loading ?
                <TextFieldBlock multiline fullWidth size="small" id="LOINotes" label="Additional notes"
                    value={notes} onChange={(e) => setNotes(e.target.value)}/>
            : <Skeleton/> }

            <FormGroup row={true}>
                <TypographySubtitle sx={{mr:'5px', fontSize: '1.05em'}}>This line of inquiry will trigger on</TypographySubtitle>
                <Tooltip arrow title="This line of inquiry will be trigger when changes on the data source are detected">
                    <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="data changes"/>
                </Tooltip>
                <Tooltip arrow title="This line of inquiry will be trigger when changes on the workflow are detected">
                    <FormControlLabel control={<Checkbox size="small"/>} label="workflow changes"/>
                </Tooltip>
            </FormGroup>
        </Box>
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
                <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                {loadingEndpoints ?
                    <Skeleton sx={{display:"inline-block"}}/>
                :
                    <Fragment>
                        <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard"  label={"Data source:"} required
                                error={errorDataSource} value={selectedDataSource} onChange={(e) => onDataSourceChange(e.target.value)}>
                            <MenuItem value="" disabled> None </MenuItem>
                            {(endpoints||[]).map((endpoint:DataEndpoint) => 
                                <MenuItem key={`endpoint_${endpoint.name}`} value={endpoint.url}>
                                    {endpoint.name}
                                </MenuItem>)
                            }
                        </Select>
                        <Box sx={{display: 'inline', ml:"5px", fontSize:".85em"}}>
                            {renderDescription(dataSourceDescription)}
                        </Box>
                    </Fragment>
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