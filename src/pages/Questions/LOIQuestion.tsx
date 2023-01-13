import { Typography } from "@mui/material"
import { QuestionList } from "components/questions/QuestionList"

export const LOIQuestion = () => {
    return (
        <div>
            <Typography variant="h6">
                You can create lines of inquiry using any of the following templates:
            </Typography>
            <QuestionList expanded kind="loi"/>
        </div>
    )
}
