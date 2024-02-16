import React from "react";
import { Box, Button, Card, Divider, Skeleton } from "@mui/material";
import { DataQueryTemplate, LineOfInquiry, Question, QuestionVariable, Workflow, WorkflowSeed } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch } from "redux/hooks";
import { QuestionLinker } from "components/questions/QuestionLinker";
import { WorkflowSeedList } from "components/methods/WorkflowList";
import { getId } from "DISK/util";
import { useGetLOIByIdQuery, usePostLOIMutation, usePutLOIMutation } from "redux/apis/lois";
import { closeBackdrop, openBackdrop } from "redux/slices/backdrop";
import { openNotification } from "redux/slices/notifications";
import { createQueryForGraph, getAllQuestionVariables, getCompleteQuestionGraph } from "components/questions/QuestionHelpers";
import { TypographySubtitle, TextFieldBlock, FieldBox } from "components/Styles";
import CancelIcon from '@mui/icons-material/Cancel';
import { EditableHeader, TriggerConditionEditor } from "components/Fields";
import { DataQueryTemplateForm } from "components/DataQuery/DataQueryTemplateForm";

export const LOIEditor = () => {
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams]= useSearchParams();
    let initQuestion = searchParams.get("q");

    const { loiId } = useParams();
    const selectedId = loiId as string;

    const {data:LOI, isLoading:loading, isError:error} = useGetLOIByIdQuery(selectedId, {skip:!selectedId});
    //const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    const [postLOI, { isLoading: isCreating }] = usePostLOIMutation();
    const [putLOI, { isLoading: isUpdating }] = usePutLOIMutation();

    const [sparqlVariableNames, setSparqlVariableNames] = React.useState<string[]>([]);
    const [sparqlVariableOptions, setSparqlVariableOptions] = React.useState<string[]>([]);
    const [editingWorkflows, setEditingWorkflows] = React.useState<boolean>(false);

    //FORM
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [dataQueryTemplate, setDataQueryTemplate] = React.useState<Partial<DataQueryTemplate>>({})

    const [workflows, setWorkflows] = React.useState<WorkflowSeed[]>([]);
    const [metaWorkflows, setMetaWorkflows] = React.useState<WorkflowSeed[]>([]);

    const [questionId, setQuestionId] = React.useState<string>("");
    const [goalQuery, setHypothesisQuery] = React.useState<string>("");
    const [updateCondition, setUpdateCondition] = React.useState<number>(1);

    // State errors...
    const [errorName, setErrorName] = React.useState<boolean>(false);
    const [errorDesc, setErrorDesc] = React.useState<boolean>(false);
    const [showErrors, setShowErrors] = React.useState<boolean>(false);

    const onNameChange = (name:string) => { setName(name); setErrorName(name.length === 0); }
    const onDescChange = (desc:string) => { setDescription(desc); setErrorDesc(desc.length === 0); }

    useEffect(() => {
        let candidates : Set<string> = new Set<string>();
        sparqlVariableNames.forEach((varName:string) => candidates.add(varName));
        let dataVars : RegExpMatchArray | null = (dataQueryTemplate.template || "").match(/\?[\w\d]+/g);
        if (dataVars) {
            dataVars.forEach((varName:string) => candidates.add(varName));
        }
        setSparqlVariableOptions(Array.from(candidates));
    }, [sparqlVariableNames, dataQueryTemplate]);
    
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
        setNotes(loi.notes || "");
        setWorkflows(loi.workflowSeeds);
        setMetaWorkflows(loi.metaWorkflowSeeds ? loi.metaWorkflowSeeds : []);
        setDataQueryTemplate(loi.dataQueryTemplate || {});
        setUpdateCondition(loi.updateCondition ? loi.updateCondition : 1);
    };

    const clearForm = () => {
        setName("");
        setDescription("");
        setNotes("");
        setDataQueryTemplate({});
        setWorkflows([]);
        setMetaWorkflows([]);
        setUpdateCondition(1);
    };

    const onSaveButtonClicked = () => {
        if (!name || !description || !questionId || !dataQueryTemplate.endpoint || !dataQueryTemplate.template) {
            if (!name) setErrorName(true);
            if (!description) setErrorDesc(true);
            setShowErrors(true);
            return;
        }

        let newLOI : LineOfInquiry;
        let previous : Partial<LineOfInquiry> = {};
        let editing : boolean = false;
        if (LOI) {
            // Edit existing hypothesis:
            previous  = { ...LOI };
            editing = true;
        }

        newLOI = {
            ...previous,
            id: editing && previous.id || "",
            name: name,
            description: description,
            notes: notes,
            question: { id: questionId },
            goalQuery: goalQuery,
            author: undefined,
            dataQueryTemplate: dataQueryTemplate as DataQueryTemplate,  //For some reason typescript does not get that endpoint cannot be undefined here... Line 108
            workflowSeeds: workflows,
            metaWorkflowSeeds: metaWorkflows,
            updateCondition: updateCondition
        };

        dispatch(openBackdrop());
        (editing?putLOI:postLOI)({data:newLOI})
            .then((response : {data?:LineOfInquiry, error?: any}) => {
                let savedLOI = (response as {data:LineOfInquiry}).data;
                if (savedLOI) {
                    console.log("LOI saved:", savedLOI);
                    navigate(PATH_LOIS + "/" + getId(savedLOI)); 
                    dispatch(openNotification({severity:'success', text:'Line of Inquiry successfully saved'}));
                } else if (error) {
                    dispatch(openNotification({severity:'error', text:'Error saving Line of Inquiry'}));
                    console.warn(error);
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
            .then((response : {data?:LineOfInquiry, error?: any}) => {
                let savedLOI = response.data;
                if (savedLOI) {
                    console.log("LOI duplicated:", savedLOI);
                    navigate(PATH_LOIS + "/" + getId(savedLOI)); 
                    dispatch(openNotification({severity:'success', text:'Line of Inquiry successfully saved'}));
                } else if (error) {
                    dispatch(openNotification({severity:'error', text:'Error saving Line of Inquiry'}));
                    console.warn(error);
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

    const onWorkflowListChange = (wfs:WorkflowSeed[], metaWfs:WorkflowSeed[]) => {
        setWorkflows(wfs);
        setMetaWorkflows(metaWfs);
    };

    const onQuestionChange = (q:Question|null, vars:string[]) => {
        setSparqlVariableNames(vars);
        setQuestionId(q ? q.id : "");
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

    const onDataQueryTemplateChange = (newValue: DataQueryTemplate) => {
        let prev : string = JSON.stringify(dataQueryTemplate);
        let next : string = JSON.stringify(newValue);
        if (prev !== next) {
            setDataQueryTemplate(newValue);
        }
    }

    return <Card variant="outlined">
        <EditableHeader loading={loading} value={name} error={errorName} onChange={onNameChange} redirect={PATH_LOIS + (LOI ? "/" + getId(LOI) : "")}/>
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
            <QuestionLinker selected={initQuestion ? initQuestion : (LOI? LOI.question.id : "")} onQuestionChange={onQuestionChange} showErrors={showErrors}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data query template:</TypographySubtitle>
            <DataQueryTemplateForm value={dataQueryTemplate} onChange={onDataQueryTemplateChange} showErrors={showErrors}/>
        </Box>
        <Divider/>

        <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle sx={{display: "inline-block"}}>Methods:</TypographySubtitle>
            <WorkflowSeedList editable={true} workflows={workflows} metaworkflows={metaWorkflows} options={sparqlVariableOptions}
                    onEditStateChange={setEditingWorkflows} onChange={onWorkflowListChange}></WorkflowSeedList>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between', padding: "10px"}}>
            {LOI?
                <Button color="info" sx={{mr:"10px"}} onClick={onDuplicateClicked}>
                    <CopyIcon/> Duplicate
                </Button> : <Box/>
            }
            <Box>
                <Button color="error" sx={{mr:"10px"}} component={Link} to={PATH_LOIS + (LOI ? "/" + getId(LOI) : "")}>
                    <CancelIcon/> Cancel
                </Button>
                <Button variant="contained" color="success" onClick={onSaveButtonClicked} disabled={editingWorkflows}>
                    <SaveIcon/> Save
                </Button>
            </Box>
        </Box>
    </Card>
}