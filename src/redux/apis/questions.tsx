import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { Question, VariableOption, QuestionOptionsRequest } from 'DISK/interfaces';
import { DISK } from "./DISK";

export const questionsAPI = createApi({
  reducerPath: 'question',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  endpoints: (builder) => ({
    getQuestions: builder.query<Question[], void>({
      query: () => 'questions',
      transformResponse: (response:Question[], meta, arg) => {
        return response.sort((q1,q2) => {
          if (!q1.category) return -1;
          if (!q2.category) return 1;
          return q2.category.id.localeCompare(q1.category.id);
        })
      }
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
  useLazyGetDynamicOptionsQuery,
  useGetVariableOptionsQuery,
  useGetDynamicOptionsQuery,
} = questionsAPI;