import { DISKAPI } from "DISK/API";
import { Hypothesis } from "DISK/interfaces";
import React, { useEffect } from "react";

export const Hypotheses = () => {
    //const hypotheses : Hypothesis[] = await DISKAPI.getHypotheses();

    const [hypotheses, setHypotheses] = React.useState<Hypothesis[]>([]);
    //componentDidMount(() => { console.log("asdqwe"); })

    useEffect(() => {
        let hypP : Promise<Hypothesis[]> =DISKAPI.getHypotheses();
        hypP.then((hypotheses:Hypothesis[]) => {
            setHypotheses(hypotheses);
        })
    }, []);

    return (
        <div>
            <span>Hypotheses</span>
            {hypotheses.map((h:Hypothesis) => <div key={h.id}> {h.name} </div>)}
        </div>
    )
}