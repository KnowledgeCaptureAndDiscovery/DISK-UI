import { Box, TextField, IconButton, Skeleton, Tooltip, Checkbox, FormControlLabel, FormGroup } from "@mui/material"
import { Link } from "react-router-dom"
import CancelIcon from '@mui/icons-material/Cancel';
import { TypographySubtitle } from "./Styles";
import { useEffect, useState } from "react";

interface EditableHeaderProps {
    loading: boolean,
    value: string,
    error: boolean,
    onChange: (name:string) => void,
    redirect: string,
}

export const EditableHeader = ({loading, value, error, redirect, onChange}: EditableHeaderProps) => {
    return <Box sx={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke" }}>
        {loading ?
            <Skeleton />
            :
            <TextField fullWidth size="small" id="form-name" label="Short name" required sx={{ backgroundColor: "white" }}
                value={value} error={error} onChange={(e) => onChange(e.target.value)} />
        }
        <Tooltip arrow title="Cancel">
            <IconButton component={Link} to={redirect}>
                <CancelIcon />
            </IconButton>
        </Tooltip>
    </Box>
}


// The order is DATA METHOD MANUAL DISABLED
interface TriggerConditionEditorProps {
    defaultValue: number,
    onChange: (newValue:number) => void
}
type TriggerConditions = 'DISABLED' | 'DATA' | 'METHOD' | 'MANUAL';
var TriggerConditionEnum = {
    DATA: 1,
    METHOD: 2,
    MANUAL: 4,
}
export const TriggerConditionEditor = ({defaultValue, onChange}:TriggerConditionEditorProps) => {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [data, setData] = useState<boolean>(false);
    const [method, setMethod] = useState<boolean>(false);
    const [manual, setManual] = useState<boolean>(false);
    const [binary, setBinary] = useState<number>(0);

    const onCheckboxChange = (kind:TriggerConditions, value:boolean) => {
        switch (kind) {
            case "DATA":
                setData(value);
                break;
            case "METHOD":
                setMethod(value);
                break;
            case "MANUAL":
                setManual(value);
                break;
            case "DISABLED":
            default:
                setDisabled(value);
                setManual(false);
                setData(false);
                setMethod(false);
                break;
        }

        if (kind === 'DISABLED') {
            setBinary(0);
        }
    }

    useEffect(() => {
        let flag = 0;
        if (data) flag = TriggerConditionEnum.DATA;
        if (method) flag |= TriggerConditionEnum.METHOD;
        if (manual) flag |= TriggerConditionEnum.MANUAL;
        setBinary(flag);
    }, [data, method, manual])

    useEffect(() => {
        onChange(binary);
    }, [binary])

    useEffect(() => {
        setDisabled(defaultValue === 0);
        if (defaultValue === 0) {
            setData(false);
            setMethod(false);
            setManual(false);
        } else {
            setData((defaultValue & TriggerConditionEnum.DATA) === TriggerConditionEnum.DATA);
            setMethod((defaultValue & TriggerConditionEnum.METHOD) === TriggerConditionEnum.METHOD);
            setManual((defaultValue & TriggerConditionEnum.MANUAL) === TriggerConditionEnum.MANUAL);
        }
    }, [defaultValue]);

    return <FormGroup row={true}>
        <TypographySubtitle>Trigger condition:</TypographySubtitle>
        <Tooltip arrow title="This line of inquiry will not be triggered">
            <FormControlLabel control={<Checkbox size="small" checked={disabled} onChange={(e) => onCheckboxChange('DISABLED', e.target.checked)}/>} label="Disabled" />
        </Tooltip>
        <Tooltip arrow title="This line of inquiry can be trigger manually">
            <FormControlLabel control={<Checkbox size="small" checked={manual} disabled={disabled} onChange={(e) => onCheckboxChange('MANUAL', e.target.checked)}/>} label="Manually" />
        </Tooltip>
        <Tooltip arrow title="This line of inquiry will be trigger when changes on the data source are detected">
            <FormControlLabel control={<Checkbox size="small" checked={data} disabled={disabled} onChange={(e) => onCheckboxChange('DATA', e.target.checked)}/>} label="On Data Changes" />
        </Tooltip>
        <Tooltip arrow title="This line of inquiry will be trigger when changes on the workflow are detected">
            <FormControlLabel control={<Checkbox size="small" checked={method} disabled={disabled} onChange={(e) => onCheckboxChange('METHOD', e.target.checked)}/>} label="On Workflow Changes" />
        </Tooltip>
    </FormGroup>
}