import { Box, FormHelperText, Autocomplete, TextField, CircularProgress, styled } from "@mui/material"
import { Question } from "DISK/interfaces";
import React from "react"
import { useGetQuestionsQuery } from "redux/apis/questions";

interface QuestionTemplateSelectorProps {
    required?: boolean,
    questionId?: string,
    onChange?: (question:Question|null) => void, 
}

export const QuestionTemplateSelector = ({required, questionId, onChange}:QuestionTemplateSelectorProps) => {
    const { data: questions, isLoading } = useGetQuestionsQuery();
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question|null>(null);
    const [selectedQuestionLabel, setSelectedQuestionLabel] = React.useState<string>("");
    const [categories, setCategories] = React.useState<{[id:string]:string}>({});

    React.useEffect(() => {
        if (questions && questions.length > 0) {
            let newCategories : {[id:string]:string} = {};
            questions.forEach((q:Question) => {
                if (q.category)
                    newCategories[q.category.id] = q.category.name;
            });
            setCategories(newCategories);
        }
    }, [questions]);

    React.useEffect(() => {
        if (questions && questions.length > 0 && questionId) {
            let question = questions.filter(q => q.id === questionId)[0]
            if (question && (!selectedQuestion || question.id != selectedQuestion.id))
                onQuestionChange(question);
        }
    }, [questions, questionId]);

    const onQuestionChange = (newQuestion:Question|null) => {
        setSelectedQuestion(newQuestion);
        if (onChange) onChange(newQuestion);
    }

    return <Box>
        <FormHelperText sx={{ margin: "2px" }}>
            Select a template that can express your hypothesis or question:
        </FormHelperText>
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
                <TextField {...params} error={required && !selectedQuestion} label="Templates"
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