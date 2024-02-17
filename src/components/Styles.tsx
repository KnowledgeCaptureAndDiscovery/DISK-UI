import styled, { StyledComponent } from "@emotion/styled";
import { TextField, TextFieldProps, Typography, Box } from "@mui/material";

export const FieldBox = styled(Box)(({ theme }) => ({
    padding: '5px 10px'
}));

export const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
}));

export const InfoInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    color: "darkgray"
}));

export const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
    lineHeight: "1.2em",
}));

export const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

export const TypographySection = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.05em"
}));

export const TextFieldBlock = styled(TextField)(({ theme }) => ({
    display: "block",
    margin: "6px 0",
})) as StyledComponent<TextFieldProps>;