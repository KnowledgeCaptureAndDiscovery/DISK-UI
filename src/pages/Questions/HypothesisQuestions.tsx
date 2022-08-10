import { Typography } from "@mui/material"
import { QuestionList } from "components/QuestionList"

export const HypothesisQuestion = () => {
    return (
        <div>
            <Typography variant="h6">
                You can create hypotheses using any of the following templates:
            </Typography>
            <QuestionList expanded kind="hypothesis"/>
        </div>
    )
}
