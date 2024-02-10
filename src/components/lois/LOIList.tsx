import { Box, Typography } from "@mui/material";
import { QuestionList } from "components/questions/QuestionList";
import { LineOfInquiry } from "DISK/interfaces"
import { LOIPreview } from "./LOIPreview";

interface LOIListProps {
    list: LineOfInquiry[],
    enableDeletion: boolean,
    enableEdition: boolean,
}

export const LOIList = ({list=[], enableDeletion=true, enableEdition=true} : LOIListProps) => {
    if (list.length === 0)
        return (
            <Box sx={{p:"10px"}}>
                <Typography variant="subtitle1">
                    You do not have any Line of inquiry. You can create a new one based on one of the following questions:
                </Typography>
                <QuestionList kind="hypothesis"/>
            </Box>
        );
    return (<Box>
        {list.map((loi: LineOfInquiry) => <LOIPreview key={loi.id} loi={loi}/>)}
    </Box>
    );
}