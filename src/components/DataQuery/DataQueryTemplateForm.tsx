import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { Box, Select, MenuItem, Card, FormHelperText, Skeleton, Chip, FormControl, InputLabel, OutlinedInput, SelectChangeEvent, useTheme, Theme } from "@mui/material";
import { DataEndpoint, DataQueryTemplate, Endpoint } from "DISK/interfaces"
import { renderDescription } from "DISK/util";
import { QueryTester } from "components/QueryTester";
import { TextFieldBlock, TypographySection } from "components/Styles";
import { useEffect, useState } from "react";
import { useGetEndpointsQuery } from "redux/apis/server";
import CodeMirror, { EditorState, ViewUpdate, lineNumbers } from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';

interface DataQueryTemplateFormProps {
    value: Partial<DataQueryTemplate>,
    onChange?: (newValue:DataQueryTemplate) => void;
    showErrors: boolean;
}

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}
const ITEM_HEIGHT = 24;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export const DataQueryTemplateForm = ({value,onChange, showErrors}:DataQueryTemplateFormProps) => {
    const theme = useTheme();
    const [dataQueryExplanation, setDataQueryExplanation] = useState<string>("");
    const [sourceUrl, setSourceUrl] = useState<string>("");
    const [sourceID, setSourceID] = useState<string>("");
    const [dataSourceDescription, setDataSourceDescription] = useState<string>("");
    const [template, setTemplate] = useState("");
    const [tableFootnote, setTableFootnote] = useState("");
    const [tableVariables, setTableVariables] = useState<string[]>([]);
    const [allVariables, setAllVariables] = useState<string[]>([]);
    const [lastLine, setLastLine] = useState(0);

    const [errorDataSource, setErrorDataSource] = useState<boolean>(false);
    const [errorQuery, setErrorQuery] = useState<boolean>(false);

    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    const QUERY_HEADER = "SELECT * WHERE {";
    const QUERY_FOOTER = "}";

    const onDataSourceChange = (ds:string) => { setSourceUrl(ds); setErrorDataSource(ds.length === 0); }

    useEffect(() => {
        if (value.description !== dataQueryExplanation) setDataQueryExplanation(value.description || "");
        if (value.footnote !== tableFootnote) setTableFootnote(value.footnote || "");
        if (value.template !== template) setTemplate(value.template || "");
        if (value.variablesToShow) setTableVariables(value.variablesToShow);
        if (value.endpoint && value.endpoint.url && value.endpoint.url !== sourceUrl) setSourceUrl(value.endpoint.url);
        if (showErrors) {
            if (!value.endpoint || !value.endpoint.url) setErrorDataSource(true);
            if (!value.template) setErrorQuery(true);
        }
    }, [value, showErrors]);

    useEffect(() => {
        setLastLine(template.split("\n").length + 2);
        // Compute variables
        let candidates : Set<string> = new Set<string>();
        let dataVars : RegExpMatchArray | null = (template || "").match(/\?[\w\d]+/g);
        if (dataVars) {
            dataVars.forEach((varName:string) => candidates.add(varName));
        }
        setAllVariables(Array.from(candidates));
    }, [template]);

    const onTemplateChange = (newValue:string, update:ViewUpdate) => {
        setTemplate(newValue);
        setErrorQuery(newValue.length === 0); //FIXME check sparql 
    }

    useEffect(() => {
        if (sourceUrl && !!endpoints) {
            for (let i = 0; i < endpoints.length; i++) {
                let ds : DataEndpoint = endpoints[i];
                if (sourceUrl === ds.url) {
                    setDataSourceDescription(ds.description);
                    setSourceID(ds.id);
                }
            }
        }
    }, [sourceUrl, endpoints]);

    useEffect(() => {
        if (onChange) onChange({
            description: dataQueryExplanation,
            template: template,
            footnote: tableFootnote,
            variablesToShow: tableVariables,
            endpoint: {id:sourceID},
        })
    }, [dataQueryExplanation, template, tableFootnote, tableVariables, sourceID]);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setTableVariables(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const removeElement = (varToRemove:string) => {
        setTableVariables(tableVariables.filter(c => c!==varToRemove));
    }

    return <>
        <TextFieldBlock fullWidth size="small" id="LOIQueryExplanation" label="Write an explanation for your data query:"
                value={dataQueryExplanation} onChange={(e) => setDataQueryExplanation(e.target.value)} />

        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <TypographySection>Template:</TypographySection>
            <QueryTester initSource={sourceUrl} initQuery={template} />
        </Box>
        {loadingEndpoints ? <Skeleton sx={{ display: "inline-block" }} /> :
            <Box sx={{ display: "flex", alignItems: "end" }}>
                <Box sx={{ display: "inline", marginRight: "10px", fontWeight: 'bold', }}>Data source:</Box>
                <Select size="small" sx={{ display: 'inline-block', minWidth: "150px", marginRight: '10px' }} variant="standard" label={"Data source:"} required
                    error={errorDataSource} value={sourceUrl} onChange={(e) => onDataSourceChange(e.target.value)}>
                    <MenuItem value="" disabled> None </MenuItem>
                    {(endpoints || []).map((endpoint: DataEndpoint) =>
                        <MenuItem key={`endpoint_${endpoint.name}`} value={endpoint.url}>
                            {endpoint.name}
                        </MenuItem>)
                    }
                </Select>
                {renderDescription(dataSourceDescription)}
            </Box>
        }
        <Box sx={{ fontSize: "0.94rem" }} >
            <Card variant="outlined" sx={{
                ...{ mt: "8px", p: "0px", position: "relative", overflow: "visible", pt: "10px" },
                ...(errorQuery ? { borderColor: "#d32f2f", } : {})
            }}>
                <FormHelperText sx={{ position: 'absolute', background: 'white', padding: '0 4px', margin: '-19px 0 0 10px', color: (errorQuery ? "#d32f2f" : 'rgba(0, 0, 0, 0.6);') }}>
                    Data query *
                </FormHelperText>
                <CodeMirror value={QUERY_HEADER}
                    extensions={[StreamLanguage.define(sparql)]}
                    readOnly
                    className={"cm-readonly header" + (lastLine > 11 ? " bigger" : "")}
                />
                <CodeMirror value={template}
                    extensions={[
                        StreamLanguage.define(sparql),
                        lineNumbers({ formatNumber: (lineNo: number, state: EditorState) => `${lineNo + 1}` })
                    ]}
                    onChange={onTemplateChange}
                />
                <CodeMirror value={QUERY_FOOTER}
                    extensions={[
                        StreamLanguage.define(sparql),
                        lineNumbers({ formatNumber: (lineNo: number, state: EditorState) => `${lastLine}` })
                    ]}
                    readOnly
                    className={"cm-readonly footer " + (lastLine > 11 ? "bigger" : "")}
                />
            </Card>
        </Box>
        <Box>
            <TypographySection>Input data retrieved:</TypographySection>
            <FormHelperText sx={{ fontSize: ".9rem" }}>
                When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
            </FormHelperText>
            <FormControl sx={{ width: "100%" }}>
                <InputLabel style={{marginTop: "-7px"}}  id="demo-multiple-chip-label">Dataset information to be shown</InputLabel>
                <Select
                    disabled={allVariables.length === 0}
                    size="small"
                    labelId="demo-multiple-chip-label"
                    multiple
                    value={tableVariables}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Dataset information to be shown" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} onMouseDown={e => e.stopPropagation()} onDelete={() => removeElement(value)}/>
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {allVariables.map((name) => (
                        <MenuItem key={name} value={name}
                            style={getStyles(name, tableVariables, theme)}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>


            <TextFieldBlock fullWidth size="small" id="LOITableDesc" label="Description of the datasets:" value={tableFootnote} onChange={(e) => setTableFootnote(e.target.value)} />
        </Box>
    </>
}