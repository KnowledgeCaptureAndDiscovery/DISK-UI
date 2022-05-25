import { Hypothesis } from "DISK/interfaces"
import ScienceIcon from '@mui/icons-material/Science';
import { PATH_HYPOTHESES } from "constants/routes";
import { PreviewInfo, PreviewItem } from "./PreviewItem";


interface HypothesisPreviewProps {
    hypothesis : Hypothesis,
    onDelete?: (h:Hypothesis) => void,
}

export const HypothesisPreview = ({hypothesis:h, onDelete:onDelete} : HypothesisPreviewProps) => {
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


    return <PreviewItem icon={ <ScienceIcon sx={{color: "orange"}}/> } item ={HypothesisToItem(h)} onDelete={onDelete? () => onDelete(h) : undefined}></PreviewItem>;
}