import { LineOfInquiry } from "DISK/interfaces"
import SettingsIcon from '@mui/icons-material/Settings';
import { PATH_LOIS } from "constants/routes";
import { PreviewInfo, PreviewItem } from "./PreviewItem";


interface LOIPreviewProps {
    LOI: LineOfInquiry,
    onDelete?: (loi:LineOfInquiry) => void,
}

export const LOIPreview = ({LOI:loi, onDelete} : LOIPreviewProps) => {
    const LOItoItem = (loi:LineOfInquiry) => {
        return {
            path: PATH_LOIS,
            id: loi.id,
            name: loi.name,
            description: loi.description,
            author: loi.author,
            dateCreated: loi.dateCreated,
            dateModified: loi.dateModified
        } as PreviewInfo;
    }

    return <PreviewItem icon={ <SettingsIcon sx={{color: "green"}}/> } item ={LOItoItem(loi)} onDelete={onDelete? () => onDelete(loi) : undefined}></PreviewItem>;
}