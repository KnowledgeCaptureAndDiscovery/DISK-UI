import { Box, Typography } from "@mui/material";
import { HypothesisPreview } from "components/goals/GoalsPreview";
import { QuestionList } from "components/questions/QuestionList";
import { Goal } from "DISK/interfaces"

interface HypothesisListProps {
    list: Goal[],
    enableDeletion: boolean,
    enableEdition: boolean,
}

export const HypothesisList = ({list=[], enableDeletion=true, enableEdition=true} : HypothesisListProps) => {
    if (list.length === 0)
        return (
            <Box sx={{p:"10px"}}>
                <Typography variant="subtitle1">
                    You do not have any hypotheses. You can create a new one based on one of the following questions:
                </Typography>
                <QuestionList kind="hypothesis"/>
            </Box>
        );
    return (<Box>
        {list.map((h: Goal) => <HypothesisPreview key={h.id} hypothesis={h}/>)}
    </Box>
    );
}