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
      // onQueryStarted is useful for optimistic updates
      // The 2nd parameter is the destructured `MutationLifecycleApi`
      async onQueryStarted(
        arg,
        { dispatch, getState, queryFulfilled, requestId, extra, getCacheEntry }
      ) {
        console.log("A", arg, getState());
      },
      // The 2nd parameter is the destructured `MutationCacheLifecycleApi`
      async onCacheEntryAdded(
        arg,
        {
          dispatch,
          getState,
          extra,
          requestId,
          cacheEntryRemoved,
          cacheDataLoaded,
          getCacheEntry,
        }
      ) {
        console.log("B", arg, getState(), getCacheEntry());
      },
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