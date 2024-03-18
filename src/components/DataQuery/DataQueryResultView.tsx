import { sparql } from "@codemirror/legacy-modes/mode/sparql"
import { Box, IconButton, Divider, Skeleton, Tooltip } from "@mui/material"
import { DataEndpoint, DataQueryResult, Endpoint } from "DISK/interfaces"
import { renderDescription } from "DISK/util"
import { TypographySubtitle, TypographyLabel, TypographyInline, InfoInline, TypographySection } from "components/Styles"
import { Fragment, useEffect, useState } from "react"
import { useGetEndpointsQuery } from "redux/apis/server"
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { DataQueryResultTable } from "./DataQueryResultTable"

interface DataQueryResultViewProps {
    result: DataQueryResult
}

export const DataQueryResultView = ({result} : DataQueryResultViewProps) => {
    const { data:endpoints, isLoading:loadingEndpoints } = useGetEndpointsQuery();
    const [dataSource, setDataSource] = useState<DataEndpoint|null>(null);
    const [formalView, setFormalView] = useState<boolean>(false);

    useEffect(() => {
        if (endpoints && endpoints.length > 0 && result.endpoint) {
            for (const e of endpoints) {
                if (e.name === result.endpoint.name) {
                    setDataSource(e);
                    return;
                }
            }
        } else {
            setDataSource(null);
        }

    }, [endpoints, result])

    return <Box sx={{padding:"5px 10px"}}>
            <TypographySubtitle>Data:</TypographySubtitle>
            <Box>
                <TypographyLabel sx={{whiteSpace: 'nowrap'}}>Data source: </TypographyLabel>
                {loadingEndpoints ? 
                    <Skeleton sx={{display:"inline-block", width: "400px"}}/> 
                    : dataSource?.name && <b style={{whiteSpace: 'nowrap'}}> { dataSource.name.replaceAll("_"," ") } </b>
                }
                <Box>
                    {dataSource?.description && renderDescription(dataSource.description)}
                </Box>
            </Box>
            <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                <Box>
                    <TypographyLabel>Data query explanation:</TypographyLabel>
                    {(result.description ?
                            <TypographyInline> {result.description} </TypographyInline>
                            : <InfoInline> None specified </InfoInline>)}
                </Box>
                <Tooltip arrow title={(formalView? "Hide" : "Show") + " data query"}>
                    <IconButton onClick={() => setFormalView(!formalView)}>
                        {formalView? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>

            {formalView && <Fragment>
                <TypographySection>Data query:</TypographySection>
                <Box sx={{fontSize: "0.94rem"}} >
                    <CodeMirror readOnly value={result.query}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                        }}
                    />
                </Box>
            </Fragment>}

            { (result.results && result.variablesToShow ) &&
            <Box> 
                <Divider/>
                 <Box>
                    <TypographySection>Input data retrieved:</TypographySection>
                    <DataQueryResultTable result={result}/>
                    {result.footnote && 
                    <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <TypographyLabel sx={{mr:"5px"}}>Table: </TypographyLabel>
                        <TypographyInline> {result.footnote} </TypographyInline>
                    </Box>}
                 </Box>
            </Box>
            }
        </Box>
}