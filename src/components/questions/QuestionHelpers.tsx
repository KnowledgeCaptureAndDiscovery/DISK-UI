import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { QuestionVariable } from "DISK/interfaces";

export const TextPart = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    borderBottom: "1px solid #c9c9c9",
    padding: "4px",
    whiteSpace: "nowrap"
}));

export const isBoundingBoxVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("BoundingBoxQuestionVariable");

export const isTimeIntervalVariable = (v:QuestionVariable) => v.subType != null && v.subType.endsWith("TimeIntervalQuestionVariable");