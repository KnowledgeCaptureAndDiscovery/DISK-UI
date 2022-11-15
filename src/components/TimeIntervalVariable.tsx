import { Box, FormControlLabel, FormGroup, Switch, TextField, Tooltip } from "@mui/material"
import { QuestionVariable } from "DISK/interfaces"
import { useState } from "react";

interface TimeIntervalVariableProps {
    variable: QuestionVariable,
}

export const TimeIntervalVariable = ({variable}: TimeIntervalVariableProps) => {
    const [CETime, setCETime] = useState<boolean>(true);

    return (
        <FormGroup sx={{display:'flex', flexDirection: 'row', alignItems: 'center'}}>
            <TextField id="start-date" label="Earliest" variant="standard" type="number" sx={{marginRight:'10px'}}/>
            <TextField id="end-date" label="Most Recent" variant="standard" type="number"/>
            <Switch defaultChecked value={CETime} onChange={() => setCETime(!CETime)}/>
            { CETime ? <Box>CE</Box> : <Tooltip title="0 = 1950CE"><Box>cal yr BP</Box></Tooltip>}
        </FormGroup>
    )
}