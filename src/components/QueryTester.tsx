import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { StreamLanguage } from '@codemirror/language';
import { DISKAPI } from "DISK/API";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { stringify } from "querystring";

interface QueryTesterProps {
    name?: string,
    initSource?: string,
    initQuery?: string,
}

export const QueryTester = ({name="Open query tester", initQuery, initSource} : QueryTesterProps) => {
    const [open, setOpen] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [dataSource, setDataSource] = useState("");
    const [query, setQuery] = useState("SELECT * WHERE {\n ?a ?b ?c \n} LIMIT 10");
    const [results, setResults] = useState<{[varName:string] : string[]}>({});
    const [total, setTotal] = useState<number>(0);

    const endpoints = useAppSelector((state:RootState) => state.server.endpoints);

    useEffect(() => {
        if (initQuery) setQuery(initQuery);
    }, [initQuery]);

    useEffect(() => {
        if (initSource) setDataSource(initSource);
    }, [initSource, endpoints]);

    const sendQuery = () => {
        if (dataSource && query) {
            setWaiting(true);
            DISKAPI.testQuery(dataSource, query, [])
                    .then((r) => {
                        setWaiting(false);
                        setResults(r)}
                    );
        }
    }

    useEffect(() => {
        console.log(results);
        for (let key of Object.keys(results)){
            setTotal(results[key].length);
            console.log(results[key].length);
            break;
        }
    }, [results])

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
                                value={dataSource} onChange={(e) => setDataSource(e.target.value)} error={dataSource.length===0} >
                            <MenuItem value="" disabled> None </MenuItem>
                            { Object.keys(endpoints || []).map((name:string) => <MenuItem key={`endpoint_${name}`} value={endpoints![name]}>{name}</MenuItem>) }
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
                    {waiting ? <Skeleton/> : (Object.keys(results).length > 0 ? <Box>
                    <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                        <Table sx={{width:"unset"}}>
                            <TableHead>
                                <TableRow>
                                    {Object.keys(results).map((varname:string) => <TableCell key={`header_${varname}`} sx={{padding: "0 10px"}}> {varname}</TableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array(total < 20 ? total : 20).fill(0).map((_,i) => 
                                <TableRow key={`row_${i}`}>
                                    {Object.values(results).map((values:string[], i) => <TableCell key={`c_${i}`} sx={{padding: "0 10px"}}> {values[i].replace(/.*\//g,'').replace(/.*#/g,'')}</TableCell>)}
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Box> : null)}
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