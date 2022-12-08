import { REACT_APP_DISK_API } from "config";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DataEndpoint, Hypothesis, Method, MethodInput, Question, QuestionOptionsRequest, VariableOption, Vocabularies } from "./interfaces";
 

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
  reducerPath: 'hypotheses',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  tagTypes: ['Hypotheses'],
  endpoints: (builder) => ({
    getHypotheses: builder.query<Hypothesis[], void>({
      query: () => 'hypotheses',
      providesTags: ['Hypotheses']
    }),
    getHypothesisById: builder.query<Hypothesis, string>({
      query: (id: string) => `hypotheses/${id}`,
    }),
    putHypothesis: builder.mutation<Hypothesis, { data: Partial<Hypothesis> }>({
      query: ({ data }) => ({
        url: `hypotheses/${data.id}`,
        headers: DISK.headers,
        method: 'PUT',
        body: data,
      }),
    }),
    postHypothesis: builder.mutation<Hypothesis, {data: Partial<Hypothesis>}>({
      query: ({ data }) => ({
        url: `hypotheses`,
        headers: DISK.headers,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Hypotheses'],
    }),

    deleteHypothesis: builder.mutation<Hypothesis, {id:string}>({
      // note: an optional `queryFn` may be used in place of `query`
      query: ({ id }) => ({
        url: `hypotheses/${id}`,
        headers: DISK.headers,
        method: 'DELETE'
      }),
      invalidatesTags: ['Hypotheses'],
    })
  })
});
 
export const {
  useGetHypothesesQuery,
  useGetHypothesisByIdQuery,
  usePutHypothesisMutation,
  usePostHypothesisMutation,
  useDeleteHypothesisMutation,
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


export const serverApi = createApi({
  reducerPath: 'server',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  endpoints: (builder) => ({
    getEndpoints: builder.query<DataEndpoint[], void>({
      query: () => 'server/endpoints',
    }),
    getVocabularies: builder.query<Vocabularies, void>({
      query: () => 'vocabulary',
    }),
  }),
});
 
export const {
  useGetEndpointsQuery,
  useGetVocabulariesQuery,
} = serverApi;


export const workflowsApi = createApi({
  reducerPath: 'workflows',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  endpoints: (builder) => ({
    getWorkflows: builder.query<Method[], void>({
      query: () => 'workflows',
    }),
    getWorkflowVariables: builder.query<MethodInput[], {id:string, source:string}>({
      query: ({id, source}) => `workflows/${source}/${id}`,
    }),
  }),
});
 
export const {
  useGetWorkflowsQuery,
  useGetWorkflowVariablesQuery,
} = workflowsApi;