import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { Hypothesis } from "DISK/interfaces";
import { DISK } from "./DISK";

export const hypothesesAPI = createApi({
  reducerPath: 'hypotheses',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  tagTypes: ['Hypotheses','Hypothesis'],
  endpoints: (builder) => ({
    getHypotheses: builder.query<Hypothesis[], void>({
      query: () => 'hypotheses',
      providesTags: ['Hypotheses']
    }),
    getHypothesisById: builder.query<Hypothesis, string>({
      query: (id: string) => `hypotheses/${id}`,
      providesTags: ['Hypothesis']
    }),
    putHypothesis: builder.mutation<Hypothesis, { data: Partial<Hypothesis> }>({
      query: ({ data }) => ({
        url: `hypotheses/${data.id}`,
        headers: DISK.headers,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hypothesis'],
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
} = hypothesesAPI;