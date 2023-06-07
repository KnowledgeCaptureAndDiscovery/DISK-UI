import { RunBinding } from "DISK/interfaces"
import { useEffect } from "react"

interface FilePreviewProps {
    binding: RunBinding
}

export const FilePreview = ({binding} : FilePreviewProps) => {
    useEffect(() => {
        console.log(binding);
    }, [binding]);

    return <></>
}