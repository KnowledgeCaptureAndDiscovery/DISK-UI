import { Hypothesis } from "DISK/interfaces"
import ScienceIcon from '@mui/icons-material/Science';
import { PATH_HYPOTHESES } from "constants/routes";
import { PreviewInfo, PreviewItem } from "./PreviewItem";


interface HypothesisPreviewProps {
    hypothesis : Hypothesis
}

export const HypothesisPreview = ({hypothesis:h} : HypothesisPreviewProps) => {
    const HypothesisToItem = (hyp:Hypothesis) => {
        return {
            path: PATH_HYPOTHESES,
            id: hyp.id,
            name: hyp.name,
            description: hyp.description,
            author: hyp.author,
            dateCreated: hyp.dateCreated,
            dateModified: hyp.dateModified
        } as PreviewInfo;
    }


    return <PreviewItem icon={ <ScienceIcon sx={{color: "orange"}}/> } item ={HypothesisToItem(h)}></PreviewItem>;
}