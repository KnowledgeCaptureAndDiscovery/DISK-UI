import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { Box, Select, MenuItem, Card, FormHelperText, Skeleton } from "@mui/material";
import { DataEndpoint, DataQueryTemplate, Endpoint } from "DISK/interfaces"
import { renderDescription } from "DISK/util";
import { QueryTester } from "components/QueryTester";
import { TextFieldBlock, TypographySection } from "components/Styles";
import { useEffect, useState } from "react";
import { useGetEndpointsQuery } from "redux/apis/server";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';


interface DataQueryTemplateFormProps {
    value: Partial<DataQueryTemplate>,
    onChange?: (newValue:DataQueryTemplate) => void;
    showErrors: boolean;
}

export const DataQueryTemplateForm = ({value,onChange, showErrors}:DataQueryTemplateFormProps) => {
    const [dataQueryExplanation, setDataQueryExplanation] = useState<string>("");
    const [sourceUrl, setSourceUrl] = useState<string>("");
    const [sourceID, setSourceID] = useState<string>("");
    const [dataSourceDescription, setDataSourceDescription] = useState<string>("");
    const [template, setTemplate] = useState("");
    const [tableFootnote, setTableFootnote] = useState("");
    const [tableVariables, setTableVariables] = useState("");

    const [errorDataSource, setErrorDataSource] = useState<boolean>(false);
    const [errorQuery, setErrorQuery] = useState<boolean>(false);

    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    const onDataSourceChange = (ds:string) => { setSourceUrl(ds); setErrorDataSource(ds.length === 0); }

    useEffect(() => {
        if (value.description !== dataQueryExplanation) setDataQueryExplanation(value.description || "");
        if (value.footnote !== tableFootnote) setTableFootnote(value.footnote || "");
        if (value.template !== template) setTemplate(value.template || "");
        if (value.variablesToShow !== tableVariables) setTableVariables(value.variablesToShow || "");
        if (value.endpoint && value.endpoint.url && value.endpoint.url !== sourceUrl) setSourceUrl(value.endpoint.url);
        if (showErrors) {
            if (!value.endpoint || !value.endpoint.url) setErrorDataSource(true);
            if (!value.template) setErrorQuery(true);
        }
    }, [value, showErrors]);

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
            endpoint: {url: sourceUrl, id:sourceID},
        })
    }, [dataQueryExplanation, template, tableFootnote, tableVariables, sourceUrl]);

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
                <CodeMirror value={template}
                    extensions={[StreamLanguage.define(sparql)]}
                    onChange={(value, viewUpdate) => {
                        setTemplate(value);
                        setErrorQuery(value.length === 0);
                    }}
                />
            </Card>
        </Box>
        <Box>
            <TypographySection>Input data retrieved:</TypographySection>
            <FormHelperText sx={{ fontSize: ".9rem" }}>
                When the data source is accessed, a table will be generated that will show the following information about the datasets retrieved:
            </FormHelperText>
            <TextFieldBlock fullWidth size="small" id="LOITableVars" label="Dataset information to be shown:" placeholder="?var1 ?var2 ..." value={tableVariables} onChange={(e) => setTableVariables(e.target.value)} />
            <TextFieldBlock fullWidth size="small" id="LOITableDesc" label="Description of the datasets:" value={tableFootnote} onChange={(e) => setTableFootnote(e.target.value)} />
        </Box>
    </>
}