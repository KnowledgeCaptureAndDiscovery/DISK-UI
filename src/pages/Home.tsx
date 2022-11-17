import { QuestionList } from "components/QuestionList"

export const Home = () => {
    return (<div>
        <p>
            <b>DISK </b>is a novel framework to test and revise hypotheses based on automatic analysis of scientific data repositories that grow over time. Given an input hypothesis,
            DISK is able to search for appropriate data to test it and revise it accordingly, and does this continuously as new data be-comes available.
            DISK is also capable of triggering new kinds of analyses when new kinds of data become available. The provenance of the revised hypotheses is recorded, with all the details of the analyses.
        </p>
        <p>
            You can visit our <a href="disk.isi.edu" target="_blank">DISK project portal</a> for more information and a list of all current DISK domain specific installations.
        </p>
    </div>)
}
