import { REACT_APP_DISK_API } from "config";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Hypothesis, Question, QuestionOptionsRequest, VariableOption } from "./interfaces";
 

export class DISK {
    public static headers : RequestInit["headers"] = {
        "Content-Type": "application/json;charset=UTF-8",
    };

    public static setToken (tkn:string) {
        if (tkn) {
            DISK.headers = {
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": `Bearer ${tkn}`,
            }
        } else {
            DISK.headers = {
                "Content-Type": "application/json;charset=UTF-8",
            }
        }
    }
}

export const hypothesisAPI = createApi({
  reducerPath: 'hypotheses2',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
    headers: DISK.headers,
  }),
  endpoints: (builder) => ({
    getHypotheses: builder.query<Hypothesis[], void>({
      query: () => 'hypotheses',
    }),
    getHypothesisById: builder.query<Hypothesis, string>({
      query: (id: string) => `hypotheses/${id}`,
    }),
    putHypothesis: builder.mutation<Hypothesis, { id: string; data: Partial<Hypothesis> }>({
      query: ({ id, data }) => ({
        url: `hypothesis/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    postHypothesis: builder.query<Hypothesis, {data: Partial<Hypothesis>}>({
      query: ({ data }) => ({
        url: `hypotheses`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});
 
export const {
  useGetHypothesesQuery,
  useGetHypothesisByIdQuery,
  usePutHypothesisMutation,
  usePostHypothesisQuery,
} = hypothesisAPI;


        /*return question.map(q => { 
            q.name = q.name.endsWith('?') ? q.name : `${q.name}?`;
            return q;*/ 

export const questionsAPI = createApi({
  reducerPath: 'question',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  endpoints: (builder) => ({
    getQuestions: builder.query<Question[], void>({
      query: () => 'questions',
    }),
    getVariableOptions: builder.query<VariableOption[], string>({
      query: (id: string) => `question/${id}/options`,
    }),
    getDynamicOptions: builder.query<{[name:string]:VariableOption[]}, { cfg: Partial<QuestionOptionsRequest> }>({
      query: ({cfg}) => ({
        url: `question/options/`,
        method: 'POST',
        headers: DISK.headers,
        body: cfg,
      }),
    }),
  }),
});
 
export const {
  useGetQuestionsQuery,
  useGetVariableOptionsQuery,
  useGetDynamicOptionsQuery,
} = questionsAPI;