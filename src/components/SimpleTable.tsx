import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Button, Link as MuiLink } from "@mui/material"
import { useState, useEffect } from "react";

interface SimpleTableProps {
    data: {[varName: string]: string[]},
    showIndex?: boolean,
    perPage?: number,
}

export const SimpleTable = ({data,showIndex=true,perPage=10}:SimpleTableProps) => {
    const [total, setTotal] = useState(0);
    const [nCols, setNCols] = useState(0);
    const [curPage, setCurPage] = useState(0);

    useEffect(() => {
        if (data) {
            let cols: number = Object.values(data).length;
            setNCols(cols);
            setTotal(cols > 0 ? Object.values(data)[0].length : 0);
        } else {
            setNCols(0);
            setTotal(0);
        }
    }, [data]);

    const renderText = (txt: string) => {
        if (txt) {
            let name: string = txt.replace(/.*\//g, "").replace(/.*#/g, "").replaceAll("_", " ");
            if (txt.startsWith("http"))
                return (
                    <MuiLink target="_blank" href={txt}>
                        {name}
                    </MuiLink>
                );
            name = name.replaceAll(" (E)", "");
            if (name.startsWith("Has"))
                name = name.substring(3);
            return <span>{name}</span>;
        }
    };

    return <TableContainer sx={{ display: "flex", justifyContent: "center" }}>
        <Table sx={{ width: "unset", border: "1px solid rgb(223 223 223)", borderRadius: "5px", mt: "4px", }}>
            <TableHead>
                <TableRow>
                    {showIndex && (
                        <TableCell sx={{ padding: "0 10px", textAlign: "end" }}>#</TableCell>
                    )}
                    {Object.keys(data).map((varname: string) => (
                        <TableCell key={`header_${varname}`} sx={{ padding: "0 10px" }}>
                            {varname}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {Array(perPage).fill(0)
                    .map((_, i) => curPage * perPage + i)
                    .map((i) => (
                        <TableRow key={`row_${i}`}>
                            {showIndex && i < total && (
                                <TableCell sx={{ padding: "0 10px", textAlign: "end" }}>
                                    {i + 1}
                                </TableCell>
                            )}
                            {i < total &&
                                Object.values(data).map((values: string[], j) => (
                                    <TableCell key={`cell_${i}_${j}`} sx={{ padding: "0 10px" }}>
                                        {renderText(values[i])}
                                    </TableCell>
                                ))}
                        </TableRow>
                    ))}
                {total > perPage &&
                    <TableRow>
                        <TableCell sx={{ padding: "0 10px" }} colSpan={nCols + (showIndex ? 1 : 0)}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
                                <Button sx={{ padding: "0" }} disabled={curPage === 0} onClick={() => setCurPage(curPage - 1)}>
                                    Previous
                                </Button>
                                <Box sx={{ fontWeight: "bold", color: "darkgray", padding: "0 10px" }}>
                                    Showing {(curPage * perPage)+1} -{" "}
                                    {(curPage + 1) * perPage < total
                                        ? (curPage + 1) * perPage
                                        : total}{" "}
                                    of {total} results
                                </Box>
                                <Button sx={{ padding: "0" }} disabled={(1 + curPage) * perPage >= total} onClick={() => setCurPage(curPage + 1)}>
                                    Next
                                </Button>
                            </Box>
                        </TableCell>
                    </TableRow>
                }
            </TableBody>
        </Table>
    </TableContainer>
}