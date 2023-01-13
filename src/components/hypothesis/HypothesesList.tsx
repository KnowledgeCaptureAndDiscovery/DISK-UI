import { Box, Typography } from "@mui/material";
import { HypothesisPreview } from "components/hypothesis/HypothesisPreview";
import { QuestionList } from "components/questions/QuestionList";
import { Hypothesis } from "DISK/interfaces"

interface HypothesisListProps {
    list: Hypothesis[],
    enableDeletion: boolean,
    enableEdition: boolean,
}

export const HypothesisList = ({list=[], enableDeletion=true, enableEdition=true} : HypothesisListProps) => {
    if (list.length === 0)
        return (
            <Box sx={{p:"5px"}}>
                <Typography variant="h6">
                    You do not have any hypotheses. You can create a new one based on one of the following questions:
                </Typography>
                <QuestionList kind="hypothesis"/>
            </Box>
        );
    return (<Box>
        {list.map((h: Hypothesis) => <HypothesisPreview key={h.id} hypothesis={h}/>)}
    </Box>
    );
}