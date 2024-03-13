import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { NarrativeModal } from "components/modal/NarrativeModal";
import { PATH_TLOIS } from "constants/routes";
import { Link } from "react-router-dom";
import { TLOIEditButton } from "./TLOIEdit";
import { Fragment, useState, useEffect } from "react";
import { GoalResult, LineOfInquiry, TriggeredLineOfInquiry, Workflow, WorkflowInstantiation } from "DISK/interfaces";
import { FileList } from "components/FileList";
import { BrainModal } from "components/modal/BrainModal";
import { ShinyModal } from "components/modal/ShinyModal";
import { BRAIN_FILENAME, SHINY_FILENAME, displayConfidenceValue } from "constants/general";
import { TLOIDeleteButton } from "./TLOIDeleteButton";
import { getId } from "DISK/util";
import { ALL_COLUMNS, ColumnName } from "components/outputs/table";

interface TLOITableProps {
    list: TriggeredLineOfInquiry[]
    loi: LineOfInquiry,
    showConfidence: boolean
}

export const TLOITable = ({list, loi, showConfidence} : TLOITableProps) => {
    const [visibleColumns, setVisibleColumns] = useState<ColumnName[]>(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);

    useEffect(() => {
        if (!showConfidence) 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Extras"]);
        else 
            setVisibleColumns(['#', "Date", "Run Status", "Input Files", "Output Files", "Confidence Value", "Extras"]);
    }, [showConfidence])

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