export const SHINY_FILENAME = "log";
export const BRAIN_FILENAME = "brain_visualization";
                        
export const displayConfidenceValue : (p:number) => string = (p) => {
    return p > 0 ?
        (p < 0.0001 ?
            p.toExponential(3)
            :
            p.toFixed(4))
        :
        "0"
}

// Ontology stuff
export const CETimeURI = 'http://disk-project.org/resources/climate/variable/CETime';
export const BPTimeURI = 'http://disk-project.org/resources/climate/variable/BPTime';
export const TimeTypeURI = 'http://disk-project.org/resources/climate/variable/TimeType';
export const StartTimeURI = 'http://disk-project.org/resources/climate/variable/StartTime';
export const StopTimeURI = 'http://disk-project.org/resources/climate/variable/StopTime';