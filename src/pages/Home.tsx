import { Typography as TYP, Box, Link, Divider, styled } from "@mui/material"

const Typography = styled(TYP)(({ theme }) => ({
    marginBottom: '4px !important',
}));

export const Home = () => {
    return (
        <Box>
            <Typography variant="h5">
                What is DISK?
            </Typography>
            <Typography>
                DISK is a general AI discovery system that automatically tests questions and hypotheses based on the data that it has access to.
            </Typography>
            <Typography>
                NeuroDISK is the DISK site devoted to neuroscience, and in particular to the <Link target="_blank" href="http://organicdatapublishing.org/enigma_new/index.php/Main_Page">ENIGMA consortium</Link>.
            </Typography>
            <Typography>
                You can specify a question, and DISK will then figure out a way to answer it.
            </Typography>
            <Divider sx={{mb:"10px"}}/>

            <Typography variant="h5">
                How Does DISK Work?
            </Typography>
            <Typography>
                DISK has access all the data available on <Link target="_blank" href="http://organicdatapublishing.org/enigma_new/index.php/Main_Page">the ENIGMA consortium wiki</Link>.
            </Typography>
            <Typography>
                DISK draws from a library of general lines of inquiry. Each line of inquiry expresses a common method to answer a type of question. For example, there is a general line of inquiry to answer the question of whether a gene is correlated with a brain characteristic, which would implement a common method which is to find genomic data from patients that have that type of cancer and does a regression with the data found. There is a different line of inquiry for the question of whether a protein is correlated with a type of cancer, which would look for proteomic data and do apply proteomics tools to the data found.
            </Typography>

            <Typography>
                When you specify a question, DISK retrieves a line of inquiry that specifies what data and method would be appropriate for it. DISK will then execute the line of inquiry, and will show you the results.
            </Typography>

            <iframe width="640" height="320" src="https://www.youtube.com/embed/LZJ-A3RyQcY" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </Box>
    )
}
