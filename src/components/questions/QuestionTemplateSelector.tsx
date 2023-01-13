import { Box, FormHelperText, Autocomplete, TextField, CircularProgress } from "@mui/material"
import { Question } from "DISK/interfaces";
import React from "react"
import { useGetQuestionsQuery } from "redux/apis/questions";

interface QuestionTemplateSelectorProps {
    title: string,
    required?: boolean,
    questionId?: string,
    onChange?: (question:Question|null) => void, 
}

export const QuestionTemplateSelector = ({title, required, questionId, onChange}:QuestionTemplateSelectorProps) => {
    const { data: questions, isLoading } = useGetQuestionsQuery();
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [selectedQuestionLabel, setSelectedQuestionLabel] = React.useState<string>("");
    const [pristine, setPristine] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (questions && questions.length > 0 && questionId) {
            let question = questions.filter(q => q.id === questionId)[0]
            if (question && (!selectedQuestion || question.id !== selectedQuestion.id))
                onQuestionChange(question);
        }
    }, [questions, questionId]);

    const onQuestionChange = (newQuestion:Question|null) => {
        setSelectedQuestion(newQuestion);
        if (onChange) onChange(newQuestion);
        if (pristine) setPristine(false);
    }

    return <Box>
        <FormHelperText sx={{ margin: "2px" }}> {title} </FormHelperText>
        <Autocomplete id="select-question" size="small" fullWidth sx={{ marginTop: "5px" }}
            value={selectedQuestion}
            groupBy={(option) => option.category ? option.category.name : 'No category'}
            onChange={(_, newQ) => onQuestionChange(newQ)}
            inputValue={selectedQuestionLabel}
            onInputChange={(_, newIn) => setSelectedQuestionLabel(newIn)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            options={questions ? questions : []}
            loading={isLoading}
            renderInput={(params) => (
                <TextField {...params} error={!pristine && required && !selectedQuestion} label="Templates"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isLoading && (<CircularProgress color="inherit" size={20} />)}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    </Box>
}