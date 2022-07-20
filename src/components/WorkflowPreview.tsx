import { Box, Card, Typography, Divider, Grid, IconButton, Tooltip, TableHead, Button, Table, TableBody, TableCell, TableContainer, TableRow, styled } from "@mui/material"
import { Workflow, VariableBinding } from "DISK/interfaces"
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";
import { getBindingAsArray } from "DISK/util";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: '0.9em',
}));

interface WorkflowPreviewProps {
    workflow: Workflow,
    button?: JSX.Element,
    onDelete?: (wf:Workflow) => void,
}

export const WorkflowPreview = ({workflow:wf, button:externalButton, onDelete} : WorkflowPreviewProps) => {
    const [maxLength, setMaxLength] = useState(0);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!!wf) {
            let max : number = 0;
            wf.bindings.forEach((vb:VariableBinding) => {
                if (vb.collection) {
                    let l : number = vb.binding.split(", ").length;
                    if (l > max) max = l;
                }
            })
            setMaxLength(max);
        }
    }, [wf]);

    const renderBinding = (binding:VariableBinding, index:number) => {
        let value : string = binding.collection ?
            getBindingAsArray(binding.binding)[index]
            : binding.binding;

        let text = value.replace(/SHA[\d\w]{6}_/,'');
        return text;
    }

    return (
        <Card key={`wf_${wf.workflow}`} variant="outlined" sx={{mb: "5px"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <a target="_blank" rel="noreferrer" href={wf.workflowLink} style={{display: "inline-flex", alignItems: "center", textDecoration: "none", color: "black"}}>
                    <DisplaySettingsIcon sx={{ marginLeft: "10px" , color: "darkgreen"}} />
                    <Typography sx={{padding:"0 10px", fontWeight: 500}}>{wf.workflow}</Typography>
                    <OpenInNewIcon sx={{fontSize: "1rem"}}/>
                </a>
                <Box>
                    {externalButton ? externalButton : ""}
                    {onDelete ? 
                    <Tooltip arrow title="Delete">
                        <IconButton onClick={() => onDelete(wf)} sx={{padding: "0 3px"}}><DeleteIcon/></IconButton>
                    </Tooltip> : ""}
                </Box>
            </Box>
            <Divider/>
            {maxLength > 1 ? 
                <Box>
                    <TypographyLabel sx={{ml:"5px"}}>Workflow bindings: </TypographyLabel>
                    <TableContainer sx={{mb:"10px"}}>
                        <Table sx={{width:"unset", ml: "20px"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}> # </TableCell>
                                    {wf.bindings.map((binding:VariableBinding, i:number, x) =>
                                        <TableCell key={`u_${binding.variable}`} sx={{padding: "0 10px"}}>
                                            {binding.variable}
                                            {i+1 === wf.bindings.length ? 
                                                <Button sx={{padding: "0", float:"right"}} onClick={() => setShowAll(!showAll)}>
                                                    {showAll ? "Less" : "More"}
                                                </Button> : null}
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {Array(showAll? maxLength : 4).fill(0).map((_,i) => 
                                <TableRow key={`row_${i}`}>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        {i+1}
                                    </TableCell>
                                    {wf.bindings.map((binding:VariableBinding) =>
                                        <TableCell key={`c_${binding.variable}_${i}`} sx={{padding: "0 10px"}}>
                                            {renderBinding(binding, i)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                            {showAll?null:
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}>
                                        5
                                    </TableCell>
                                    <TableCell sx={{padding: "0 10px"}} colSpan={wf.bindings.length}>
                                        <Box sx={{display:"flex", justifyContent:"center"}}> . . . </Box>
                                    </TableCell>
                                </TableRow>
                            }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            :
                <Box sx={{fontSize:".85rem"}}>
                    { wf.bindings.map((binding:VariableBinding) =>
                        <Grid key={`var_${binding.variable}`} container spacing={1}>
                            <Grid item xs={3} md={2} sx={{textAlign: "right"}}>
                                <b>{binding.variable}: </b>
                            </Grid>
                            <Grid item xs={9} md={10}>
                                {binding.binding}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            }
        </Card>
    );
}