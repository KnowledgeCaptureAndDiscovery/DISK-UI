import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { TriggeredLineOfInquiry } from 'DISK/interfaces';
import { DISK } from "./DISK";
import { getId } from 'DISK/util';

export const tloisAPI = createApi({
  reducerPath: 'tlois',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  tagTypes: ['TLOIs', 'TLOI'],
  endpoints: (builder) => ({
    getTLOIs: builder.query<TriggeredLineOfInquiry[], void>({
      query: () => 'tlois',
      providesTags: ['TLOIs']
    }),
    getTLOIById: builder.query<TriggeredLineOfInquiry, string>({
      query: (id: string) => `tlois/${getId({id})}`,
      providesTags: ['TLOI']
    }),
    executeHypothesisById: builder.mutation<TriggeredLineOfInquiry[], string>({
      query: (id: string) => `hypotheses/${getId({id})}/query`,
      invalidatesTags: ['TLOIs'],
    }),
    putTLOI: builder.mutation<TriggeredLineOfInquiry, { data: Partial<TriggeredLineOfInquiry> }>({
      query: ({ data }) => ({
        url: `tlois/${data.id}`,
        headers: DISK.headers,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TLOI'],
    }),
    postTLOI: builder.mutation<TriggeredLineOfInquiry, {data: Partial<TriggeredLineOfInquiry>}>({
      query: ({ data }) => ({
        url: `tlois`,
        headers: DISK.headers,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TLOIs'],
    }),
    deleteTLOI: builder.mutation<TriggeredLineOfInquiry, {id:string}>({
      query: ({ id }) => ({
        url: `tlois/${getId({id})}`,
        headers: DISK.headers,
        method: 'DELETE'
      }),
      invalidatesTags: ['TLOIs'],
    })
  })
});

export const {
  useGetTLOIsQuery,
  useGetTLOIByIdQuery,
  useExecuteHypothesisByIdMutation,
  usePutTLOIMutation,
  usePostTLOIMutation,
  useDeleteTLOIMutation,
} = tloisAPI;