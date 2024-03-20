import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useState, useEffect } from "react";
import { LineOfInquiry, TriggeredLineOfInquiry } from "DISK/interfaces";
import { ALL_COLUMNS, ColumnName } from "components/files/outputs/table";

interface TLOITableProps {
    list: TriggeredLineOfInquiry[]
}

export const TLOITable = ({list} : TLOITableProps) => {
    const [visibleColumns, setVisibleColumns] = useState<ColumnName[]>(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);

    useEffect(() => {
        // If theres at least one confidence value, show that column
        let showConfidence = false;
        for (const tloi of list) {
            for (const wf of [...tloi.workflows, ...tloi.metaWorkflows]) {
                for (const exec of wf.executions) {
                    if (exec.result && exec.result.confidenceValue > 0) {
                        showConfidence = true;
                        break;
                    }
                }
            }
        }

        if (!showConfidence) 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Extras"]);
        else 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);
    }, [list])

    return <TableContainer sx={{ display: "flex", justifyContent: "center" }}>
        <Table sx={{ width: "unset" }}>
            <TableHead>
                <TableRow>
                    {visibleColumns.map((name:string) => <TableCell key={name} sx={{ padding: "0 10px" }}>{name}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {list.map((tloi:TriggeredLineOfInquiry, i:number) => 
                    <TableRow key={tloi.id}>{
                        visibleColumns.map((name:ColumnName, j:number) => 
                            <TableCell sx={{ padding: "0 10px"}} key={`cell_${i}_${j}`}>
                                { ALL_COLUMNS[name](tloi, i) }
                            </TableCell>
                        )
                    }</TableRow>
                )}
            </TableBody>
        </Table>
    </TableContainer>
}