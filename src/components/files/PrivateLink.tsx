import { Link as MuiLink, Tooltip } from "@mui/material"
import { useEffect, useState } from "react";
import { downloadPlainText } from "./download";

interface PrivateLinkProp {
    filename: string,
    url: string,
    preview?: boolean,
    value: string | undefined
}

export const PrivateLink = ({filename, url, preview, value}:PrivateLinkProp) => {
    const [isURL, setIsURL] = useState<boolean>(false);

    useEffect(() => {
        setIsURL(!!value && value.startsWith("http"));
    }, [url, value]);

    const downloadFile = () => {
        if (value !== undefined) {
            downloadPlainText(value, filename);
        }
    }

    if (value === undefined) {
        return <Tooltip arrow title="File is not available to download">
            <MuiLink color="inherit" sx={{ cursor: "not-allowed" }}>
                {filename}
            </MuiLink>
        </Tooltip>
    }

    //TODO: preview was removed, check if we need it here.
    return <div>
        {isURL ? 
            <a href={value} target="_blank" rel="noreferrer"> {filename} </a> :
            <MuiLink color="inherit" onClick={downloadFile} sx={{cursor:"pointer"}}>
                {filename}
            </MuiLink>
        }
    </div>
}