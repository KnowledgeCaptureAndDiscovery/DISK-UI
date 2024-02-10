import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Skeleton } from "@mui/material";
import { Goal, RunBinding, TriggeredLineOfInquiry, Workflow, WorkflowRun } from "DISK/interfaces";
import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title,
    Tooltip, Legend, ChartData, ChartOptions, Chart, TooltipModel, LogarithmicScale } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { findOutputInRuns } from "DISK/util";
import { DISK } from "redux/apis/DISK";
import { useFilteredTLOIs, useOutputs } from "redux/hooks/tloi";

ChartJS.register(CategoryScale, LogarithmicScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ConfidencePlotProps {
    goal?: Goal,
    loiId?: string,
}

export const ConfidencePlot = ({ goal: hypothesis, loiId }: ConfidencePlotProps) => {
    const { data: visibleTLOIs, isLoading: loadingTLOIs} = useFilteredTLOIs({
        hypothesisId: hypothesis?.id,
        loiId: loiId,
        sort: (t1, t2) => t1.dateCreated!.localeCompare(t2.dateCreated!)
    });

    const [files, setFiles] = useState<{ [key: string]: RunBinding }>({});
    const [selectedFile, setSelectedFile] = useState<string>("");

    const [idToLabel, setIdToLabel] = useState<{[id:string]: string}>({});
    const [contentType, setContentType] = useState<string>("");
    const [content, setContent] = useState<{[label:string]: any}>({});
    const [data, setData] = useState<ChartData<"line", number[], unknown>>();

    const x = useOutputs({data:visibleTLOIs});

    useEffect(() => {
        if (x.image && Object.keys(files).length > 0 && Object.keys(x.image).length > 0) {
            let name = Object.keys(x.image)[0];
            handleOutputChange(null, name);

        }
    }, [x, files])

    //Sets output types, and create data for plot.
    useEffect(() => {
        let outputs: { [name: string]: RunBinding } = {};
        let pValues: { [label: string]: number } = {};
        let labelDic: { [uri: string]: string } = {};
        let labels: string[] = [];

        //  TODO:
        //visibleTLOIs
        //    .sort((t1, t2) => {
        //        return t1.dateCreated.localeCompare(t2.dateCreated);
        //    }).forEach((tloi: TriggeredLineOfInquiry) => {
        //        let nInputs = 0;
        //        [...tloi.workflows, ...tloi.metaWorkflows].forEach((wf: Workflow) => {
        //            Object.values(wf.runs || {}).forEach((run: WorkflowRun) => {
        //                Object.keys(run.outputs).forEach((outName) => {
        //                        outputs[outName] = run.outputs[outName];
        //                })
        //                nInputs += Object.keys(run.inputs).length;
        //            });
        //        });
        //        let label = "N = " + String(nInputs);
        //        labels.push(label);
        //        labelDic[tloi.id] = label;
        //        pValues[label] = tloi.confidenceValue;
        //    });

        setData({
            labels: labels,
            datasets: [{
                label: "p-value",
                data: Object.values(pValues),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        });

        setFiles(outputs);
        setIdToLabel(labelDic);
        setSelectedFile(Object.keys(outputs).length > 0 ? Object.keys(outputs)[0] : "");
    }, [visibleTLOIs])

    useEffect(() => {
        if (visibleTLOIs && visibleTLOIs.length > 0 && selectedFile) {
            visibleTLOIs.forEach((tloi) => {
                const [source, binding] = findOutputInRuns(tloi, selectedFile);
                if (source && binding && binding.id && binding.type === "URI" && !content[idToLabel[tloi.id]]) {
                    DISK.downloadPrivateFile({source:source, dataId:binding.id}).then((response) => {
                        if (response.status === 200) {
                            let newType = response.headers.has('content-type') ? response.headers.get('content-type') as string : "";
                            if (newType !== contentType)
                                setContentType(newType);

                            response.blob().then((file) => {
                                if (newType.startsWith('application') || newType.startsWith('text')) {
                                    file.text().then((txt) => {
                                        setContent((oldContent) => ({
                                            ...oldContent,
                                            [idToLabel[tloi.id]]: txt,
                                        }));
                                    });
                                } else {
                                    setContent((oldContent) => ({
                                        ...oldContent,
                                        [idToLabel[tloi.id]]: window.URL.createObjectURL(file)
                                    }));
                                }
                            });
                        }
                    });
                }
            });
        }
    }, [visibleTLOIs, selectedFile])

    const getOrCreateTooltip = (chart: Chart) => {
        let tooltipEl: HTMLDivElement | undefined = chart.canvas.parentNode?.querySelector('#plot-tooltip') as HTMLDivElement;
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'plot-tooltip';
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = "1";
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-50%, 0)';
            tooltipEl.style.transition = 'all .1s ease';

            const table = document.createElement('table');
            table.style.margin = '0px';
            tooltipEl.appendChild(table);
            chart.canvas.parentNode?.appendChild(tooltipEl);
        }
        return tooltipEl;
    };

    const externalTooltipHandler = ({ chart, tooltip }: { chart: Chart, tooltip: TooltipModel<"line"> }) => {
        // Tooltip Element
        const tooltipEl = getOrCreateTooltip(chart);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
        }

        // Set Text
        if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(b => b.lines);

            const tableHead = document.createElement('thead');

            titleLines.forEach(title => {
                const tr = document.createElement('tr');
                tr.style.borderWidth = "0";

                const th = document.createElement('th');
                th.style.borderWidth = "0";
                const text = document.createTextNode(title);

                th.appendChild(text);
                tr.appendChild(th);
                tableHead.appendChild(tr);
            });

            const tableBody = document.createElement('tbody');
            bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i];

                const span = document.createElement('span');
                span.style.background = colors.backgroundColor.toString();
                span.style.borderColor = colors.borderColor.toString();
                span.style.borderWidth = '2px';
                span.style.marginRight = '10px';
                span.style.height = '10px';
                span.style.width = '10px';
                span.style.display = 'inline-block';

                const tr = document.createElement('tr');
                tr.style.backgroundColor = 'inherit';
                tr.style.borderWidth = "0";

                const td = document.createElement('td');
                td.style.borderWidth = "0";

                //@ts-ignore
                const text = document.createTextNode(body);

                td.appendChild(span);
                td.appendChild(text);
                tr.appendChild(td);
                tableBody.appendChild(tr);
            });

            if (contentType && tooltip.title && tooltip.title.length > 0) {
                const td = document.createElement('td');
                td.style.borderWidth = "0";
                const name = tooltip.title[0];

                if (contentType.startsWith("image")) {
                    const img = document.createElement('img');
                    img.src = content[name];
                    img.style.maxWidth = "350px";
                    td.appendChild(img);
                } else {
                    const span = document.createElement('span');
                    span.innerText = content[name];
                    span.style.fontSize = ".8em"
                    td.appendChild(span);
                }

                const tr = document.createElement('tr');
                tr.style.backgroundColor = 'inherit';
                tr.style.borderWidth = "0";
                tr.appendChild(td);
                tableBody.appendChild(tr);
            }

            const tableRoot = tooltipEl.querySelector('table');
            if (tableRoot) {
                // Remove old children
                while (tableRoot.firstChild) {
                    tableRoot.firstChild.remove();
                }

                // Add new children
                tableRoot.appendChild(tableHead);
                tableRoot.appendChild(tableBody);
            }
        }

        const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = "1";
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        //tooltipEl.style.font = tooltip.options.bodyFont.string;
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
    };

    // Plot config
    const options: ChartOptions<"line"> = {
        responsive: true,
        scales: {
            y: {
                type: "logarithmic",
            }
        },
        aspectRatio: 4,
        plugins: {
            legend: {
                display: false,
                position: "top"
            },
            title: {
                display: true,
                text: '[Number of Inputs] vs [p-value]',
            },
            tooltip: {
                enabled: false,
                position: "nearest",
                external: externalTooltipHandler
            }
        },
    };

    if (loadingTLOIs)
        return <Skeleton />;

    if (visibleTLOIs.length < 3)
        return <></>

    const handleOutputChange = (_:any, val:string) => {
        if (val !== selectedFile) {
            setContent({});
            setContentType("");
            setSelectedFile(val);
        }
    }

    return <Box>
        <Box>
            {x.image !== undefined && Object.keys(x.image || {}).length === 1 && <Box>
                Showing {Object.keys(x.image)[0]} file on previews.
            </Box>}
            {Object.keys(x.image || {}).length > 1 &&
                <FormControl style={{display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <FormLabel id="demo-row-radio-buttons-group-label" style={{marginRight: "10px"}} >Output file: </FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={selectedFile}
                        onChange={handleOutputChange}
                    >
                        {Object.keys(x.image||{}).map((name) =>
                            <FormControlLabel value={name} key={name} control={<Radio />} label={name} />
                        )}
                    </RadioGroup>
                </FormControl>
            }
        </Box>
        {data &&
            <Box style={{height:"250px"}}>
                <Line options={options} data={data}/>
            </Box>
        }
    </Box>
}