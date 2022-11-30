import { Box, FormControlLabel, FormGroup, Switch, TextField, Tooltip } from "@mui/material"
import { QuestionVariable } from "DISK/interfaces"
import { useState } from "react";
import { OptionBinding } from "./BoundingBoxMap";

interface TimeIntervalVariableProps {
    variable: QuestionVariable,
    onChange?: (bindings:OptionBinding[]) => void
}

export const CETimeURI = 'http://disk-project.org/resources/climate/variable/CETime';
export const BPTimeURI = 'http://disk-project.org/resources/climate/variable/BPTime';
export const TimeTypeURI = 'http://disk-project.org/resources/climate/variable/TimeType';
export const StartTimeURI = 'http://disk-project.org/resources/climate/variable/StartTime';
export const StopTimeURI = 'http://disk-project.org/resources/climate/variable/StopTime';

export const TimeIntervalVariable = ({variable, onChange}: TimeIntervalVariableProps) => {
    const [CETime, setCETime] = useState<boolean>(true);
    const [startTimeError, setStartTimeError] = useState<boolean>(false);
    const [stopTimeError, setStopTimeError] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number|null>(null);
    const [stopTime, setStopTime] = useState<number|null>(null);

    const onStartTimeChange = (ev: any) => {
        if (ev.target.value) {
            let value : number = parseInt(ev.target.value);
            setStartTime(value);
            setStartTimeError(!!stopTime && stopTime < value);
            if (stopTimeError && stopTime && stopTime > value) {
                setStopTimeError(false);
            }
            if (onChange) {
                onChange([
                    {
                        variable: {
                            id: StartTimeURI,
                            variableName: '?MinTime'
                        } as QuestionVariable,
                        value: {
                            id: value.toString(),
                            name: value.toString()
                        }
                    },
                    {
                        variable: {
                            id: TimeTypeURI,
                            variableName: '?TimeType'
                        } as QuestionVariable,
                        value: {
                            id: CETime ? CETimeURI : BPTimeURI,
                            name: CETime ? "CE Time" : "BP Time",
                        }
                    },
                ]);
            }
        }
    }

    const onStopTimeChange = (ev: any) => {
        if (ev.target.value) {
            let value = parseInt(ev.target.value);
            setStopTime(value);
            setStopTimeError(!!startTime && startTime > value);
            if (startTimeError && startTime && startTime < value) {
                setStartTimeError(false);
            }
            if (onChange) {
                onChange([
                    {
                        variable: {
                            id: StopTimeURI,
                            variableName: '?MaxTime'
                        } as QuestionVariable,
                        value: {
                            id: value.toString(),
                            name: value.toString()
                        }
                    },
                    {
                        variable: {
                            id: TimeTypeURI,
                            variableName: '?TimeType'
                        } as QuestionVariable,
                        value: {
                            id: CETime ? CETimeURI : BPTimeURI,
                            name: CETime ? "CE Time" : "BP Time",
                        }
                    },
                ]);
            }
        }
    }

    const onTimeToggle = () => {
        setCETime(!CETime);
        if (onChange) {
            onChange([
                {
                    variable: {
                        id: TimeTypeURI,
                        variableName: '?TimeType'
                    } as QuestionVariable,
                    value: {
                        id: !CETime ? CETimeURI : BPTimeURI,
                        name: !CETime ? "CE Time" : "BP Time",
                    }
                },
            ]);
        }
    }

    return (
        <FormGroup sx={{display:'flex', flexDirection: 'row', alignItems: 'center'}}>
            <TextField id="start-date" label="Earliest" variant="standard" type="number" sx={{marginRight:'10px'}} required 
                error={startTimeError}
                value={startTime == null ? '' : startTime}
                onChange={onStartTimeChange}
            />
            <TextField id="end-date" label="Most Recent" variant="standard" type="number" required 
                error={stopTimeError}
                value={stopTime == null ? '' : stopTime}
                onChange={onStopTimeChange}
            />
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', pt: '4px'}}>
                <Switch defaultChecked value={CETime} onChange={onTimeToggle}/>
                {CETime ? <Box>CE</Box> : <Tooltip title="0 = 1950CE"><Box>cal yr BP</Box></Tooltip>}
            </Box>
        </FormGroup>
    )
}