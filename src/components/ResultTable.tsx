import { Box, Button, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink, } from "@mui/material";
import { DataEndpoint } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { useQueryExternalSourceQuery } from "redux/apis/server";
import { SimpleTable } from "./SimpleTable";

interface ResultTableProps {
  query: string;
  variables: string;
  dataSource: DataEndpoint;
  indexes?: boolean;
}

export const ResultTable = ({query, variables, dataSource, indexes = true}: ResultTableProps) => {
  const {data:results,isLoading:waiting,isError} = useQueryExternalSourceQuery({dataSource:dataSource,query:query,variables:variables.split(" ")});

  return (
    <Box>
      {waiting ? (
        <Skeleton />
      ) : results && Object.keys(results).length > 0 ? (
        <Box>
          <SimpleTable data={results}/>
        </Box>
      ) : (
        <Box>No data found</Box>
      )}
    </Box>
  );
};
