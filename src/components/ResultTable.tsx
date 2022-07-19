import { Box, Button, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { DataEndpoint } from "DISK/interfaces";
import { Fragment, useEffect, useState } from "react";

interface ResultTableProps {
    query: string,
    variables: string,
    dataSource: DataEndpoint,
    indexes?: boolean,
}

const MAX_PER_PAGE = 10;

export const ResultTable = ({query, variables, dataSource, indexes=true} : ResultTableProps) => {
    const [results, setResults] = useState<{[varName:string] : string[]}>({});
    const [waiting, setWaiting] = useState(false);
    const [total, setTotal] = useState(0);
    const [nCols, setNCols] = useState(0);
    const [curPage, setCurPage] = useState(0);

    useEffect(() => {
        if (!!query && !!variables && !!dataSource) {
            setWaiting(true);
            DISKAPI.testQuery(dataSource.url, query, variables.split(" "))
                    .then((results) => {
                        let cols : number = Object.values(results).length;
                        if (cols > 0) {
                            setNCols(cols);
                            setTotal(Object.values(results)[0].length);
                        } else {
                            setNCols(0);
                            setTotal(0);
                        }
                        // If the data source has a prefix resolution, we replace it over the prefix.
                        if (dataSource.prefix && dataSource.namespace && dataSource.prefixResolution) {
                            Object.keys(results).forEach((varName:string) => {
                                let newValues : string[] = [];
                                results[varName].forEach((val) => newValues.push(val.replace(dataSource.namespace, dataSource.prefixResolution)));
                                results[varName] = newValues;
                            })
                        }
                        setResults(results);
                        setWaiting(false);
                    });
        }
    }, [query, variables, dataSource])

    const renderText = (txt:string) => {
        let name : string = txt.replace(/.*\//g,'').replace(/.*#/g,'');
        if (txt.startsWith("http"))
            return <MuiLink target="_blank" href={txt}>{name}</MuiLink>
        return <span>{name}</span>
    }

    return <Box> 
        {waiting ?
            <Skeleton/> 
            : 
            (Object.keys(results).length > 0 ? 
                <Box>
                    <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                        <Table sx={{width:"unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt:"4px"}}>
                            <TableHead>
                                <TableRow>
                                    {indexes && <TableCell sx={{padding: "0 10px", textAlign:"end"}}> # </TableCell>}
                                    {Object.keys(results).map((varname:string) => <TableCell key={`header_${varname}`} sx={{padding: "0 10px"}}> {varname}</TableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(MAX_PER_PAGE).fill(0)].map((_,i) => curPage*MAX_PER_PAGE + i ).map((i) => 
                                    <TableRow key={`row_${i}`}>
                                        {indexes && i<total && <TableCell sx={{padding: "0 10px", textAlign: "end"}}>{i+1}</TableCell>}
                                        {i<total && Object.values(results).map((values:string[], j) =>
                                            <TableCell key={`cell_${i}_${j}`} sx={{padding: "0 10px"}}>
                                                {renderText(values[i])}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}} colSpan={nCols + (indexes ? 1 : 0)}>
                                        <Box sx={{display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                                            <Button sx={{padding:"0"}} disabled={curPage===0} onClick={() => setCurPage(curPage-1)}>Previous</Button>
                                            <Box sx={{fontWeight:"bold", color:"darkgray", padding: "0 10px"}}>
                                                Showing {(curPage)*MAX_PER_PAGE} - {(curPage+1) * MAX_PER_PAGE < total ? (curPage+1) * MAX_PER_PAGE : total} of {total} results
                                            </Box>
                                            <Button sx={{padding:"0"}} disabled={(1+curPage)*MAX_PER_PAGE > total} onClick={() => setCurPage(curPage+1)}>Next</Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box> 
                :
                <Box>
                    No data found
                </Box>
            )
        }
    </Box>;
}