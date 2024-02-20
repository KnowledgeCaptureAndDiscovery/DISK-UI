import { Box, FormGroup, Switch, TextField, Tooltip } from "@mui/material"
import { TimeIntervalQuestionVariable } from "DISK/interfaces"
import { useState } from "react";
import { OptionBinding } from "./BoundingBoxMap";
import { setQuestionBindings } from "redux/slices/forms";
import { useAppDispatch, useQuestionBindings } from "redux/hooks";
import { StartTimeURI, TimeTypeURI, CETimeURI, BPTimeURI, StopTimeURI } from "constants/general";

interface TimeIntervalVariableProps {
    variable: TimeIntervalQuestionVariable,
    onChange?: (bindings:OptionBinding[]) => void
}

export const TimeIntervalVariable = ({variable}: TimeIntervalVariableProps) => {
    const dispatch = useAppDispatch();
    const bindings = useQuestionBindings();

    const [CETime, setCETime] = useState<boolean>(true);
    const [startTimeError, setStartTimeError] = useState<boolean>(false);
    const [stopTimeError, setStopTimeError] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number|null>(null);
    const [stopTime, setStopTime] = useState<number|null>(null);
    const [startTimeout, setStartTimeout] = useState<NodeJS.Timeout|null>(null);
    const [stopTimeout, setStopTimeout] = useState<NodeJS.Timeout|null>(null);

    const changeTimeBinding = (timeUri:string, time:number|null) => {
        let newBindings = { ...bindings };
        if (time) {
            newBindings[timeUri] = {values: [time.toString()]};
            newBindings[TimeTypeURI] = {values:[CETime ? CETimeURI : BPTimeURI]};
        } else {
            delete newBindings[timeUri];
            delete newBindings[TimeTypeURI];
        }
        dispatch(setQuestionBindings(newBindings));
    };
    
    const onStartTimeChange : React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>  = (ev) => {
        let value : number | null = null;
        if (ev.target.value) {
            value = parseInt(ev.target.value);
            setStartTime(value);
            setStartTimeError(!!stopTime && stopTime < value);
            if (stopTimeError && stopTime && stopTime > value) {
                setStopTimeError(false);
            }
        }

        if (startTimeout) clearTimeout(startTimeout)
        setStartTimeout(setTimeout(() => {
            changeTimeBinding(StartTimeURI, value);
            setStartTimeout(null);
        }, 500));
    }

    const onStopTimeChange : React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>  = (ev) => {
        let value : number | null = null;
        if (ev.target.value) {
            let value = parseInt(ev.target.value);
            setStopTime(value);
            setStopTimeError(!!startTime && startTime > value);
            if (startTimeError && startTime && startTime < value) {
                setStartTimeError(false);
            }
        }

        if (stopTimeout) clearTimeout(stopTimeout)
        setStopTimeout(setTimeout(() => {
            changeTimeBinding(StopTimeURI, value);
            setStopTimeout(null);
        }, 500));
    }

    const onTimeToggle = () => {
        let newBindings = { ...bindings };
        newBindings[TimeTypeURI] = { values: [!CETime ? CETimeURI : BPTimeURI] };
        setCETime(!CETime);
        dispatch(setQuestionBindings(newBindings));
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