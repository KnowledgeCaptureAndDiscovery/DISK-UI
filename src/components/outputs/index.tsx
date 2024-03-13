import { OutputType } from "DISK/interfaces"

export interface SelectorField {
    label:string,
    tooltip:string,
}

export const OUTPUT_SELECTORS : Record<OutputType, SelectorField> = {
    DROP: {
        label: "Ignore output",
        tooltip: "Do not store the file on DISK. The file will still be available on WINGS."
    },
    SAVE: {
        label: "Save file",
        tooltip: "The file will be stored on the DISK server."
    },
    PROCESS: {
        label: "Process file",
        tooltip: "The file will be read by DISK."
    }
}

export type OutputBindingValue = '_CONFIDENCE_VALUE_' |
        '_SHINY_LOG_' |
        '_BRAIN_VISUALIZATION_' |
        '_DOWNLOAD_ONLY_' |
        '_IMAGE_' |
        '_VISUALIZE_';

export const SECOND_SELECTORS : Record<OutputType, Partial<Record<OutputBindingValue, SelectorField>>> = {
    DROP: {},
    PROCESS: {
        _CONFIDENCE_VALUE_: {
            label: "Process as confidence value file",
            tooltip: "The first line of the file will be read as a number.",
        },
        _SHINY_LOG_: {
            label: "Process as Shiny log",
            tooltip: "The file is a shiny output log, where we can find links to visualizations.",
        },
        _BRAIN_VISUALIZATION_: {
            label: "Process as brain visualization",
            tooltip: "The file must be a json configuration file.",
        },
    },
    SAVE: {
        _DOWNLOAD_ONLY_: {
            label: "Provide download link",
            tooltip: "The file will be available for download to any DISK user.",
        }, _IMAGE_: {
            label: "Store as image to be displayed",
            tooltip: "The file will be available for visualization and download.",
        }, _VISUALIZE_: {
            label: "Store as main visualization",
            tooltip: "The file will be available for visualization and download." +
                "The latest version of this file will be show in the hypothesis page.",
        }
    }
}