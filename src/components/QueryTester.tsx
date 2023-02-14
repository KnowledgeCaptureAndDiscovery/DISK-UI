import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Typography } from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { DataEndpoint } from "DISK/interfaces";
import { ResultTable } from "./ResultTable";
import { useGetEndpointsQuery } from "redux/apis/server";

interface QueryTesterProps {
    name?: string,
    initSource?: string,
    initQuery?: string,
}

export const QueryTester = ({name="Open query tester", initQuery, initSource} : QueryTesterProps) => {
    const [open, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState<DataEndpoint|null>(null);
    const [query, setQuery] = useState("SELECT * WHERE {\n ?a ?b ?c \n} LIMIT 10");
    const [queryToSend, setQueryToSend] = useState("");
    const { data:endpoints } = useGetEndpointsQuery();

    useEffect(() => {
        if (initQuery) setQuery(initQuery);
    }, [initQuery]);

    useEffect(() => {
        if (initSource && endpoints) {
            setDataSourceByUrl(initSource);
        }
    }, [initSource, endpoints]);

    const setDataSourceByUrl = (url:string) => {
        if (endpoints && endpoints.length > 0) {
            endpoints.forEach((e:DataEndpoint) => {
                if (e.url === url)
                    setDataSource(e);
            })
        }
    }

    const sendQuery = () => {
        setQueryToSend(query);
    }

    return (
        <Fragment>
            <Button onClick={() => setOpen(true)}>
                {name}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Query tester
                    <IconButton aria-label="close" onClick={() => setOpen(false)}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{display: "inline-flex", alignItems: "center"}}>
                        <Typography sx={{display: "inline-block", marginRight: "5px"}}> Data source: </Typography>
                        <Select size="small" sx={{display: 'inline-block', minWidth: "150px"}} variant="standard"  label={"Data source:"} required
                                value={dataSource?.url} onChange={(e) => setDataSourceByUrl(e.target.value)} error={dataSource === null} >
                            <MenuItem value="" disabled> None </MenuItem>
                            {(endpoints||[]).map((endpoint:DataEndpoint) =>
                                <MenuItem key={`endpoint_${endpoint.name}`} value={endpoint.url}>
                                    {endpoint.name}
                                </MenuItem>)
                            }
                        </Select>
                    </Box>
                    <CodeMirror value={query}
                        extensions={[StreamLanguage.define(sparql)]}
                        onChange={(value, viewUpdate) => {
                            setQuery(value);
                            console.log('value:', value);
                        }}
                        onBlur={console.log}
                    />
                    {queryToSend && dataSource && <ResultTable query={queryToSend} dataSource={dataSource} variables={'*'}/> }
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={sendQuery}>
                    Query
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}