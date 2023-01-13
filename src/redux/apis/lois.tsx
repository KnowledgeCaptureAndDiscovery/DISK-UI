import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { LineOfInquiry } from 'DISK/interfaces';
import { DISK } from "./DISK";

export const loisAPI = createApi({
  reducerPath: 'lois',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  tagTypes: ['LOIs', 'LOI'],
  endpoints: (builder) => ({
    getLOIs: builder.query<LineOfInquiry[], void>({
      query: () => 'lois',
      providesTags: ['LOIs']
    }),
    getLOIById: builder.query<LineOfInquiry, string>({
      query: (id: string) => `lois/${id}`,
      providesTags: ['LOI']
    }),
    putLOI: builder.mutation<LineOfInquiry, { data: Partial<LineOfInquiry> }>({
      query: ({ data }) => ({
        url: `lois/${data.id}`,
        headers: DISK.headers,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LOI'],
    }),
    postLOI: builder.mutation<LineOfInquiry, {data: Partial<LineOfInquiry>}>({
      query: ({ data }) => ({
        url: `lois`,
        headers: DISK.headers,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOIs'],
    }),
    deleteLOI: builder.mutation<LineOfInquiry, {id:string}>({
      query: ({ id }) => ({
        url: `lois/${id}`,
        headers: DISK.headers,
        method: 'DELETE'
      }),
      invalidatesTags: ['LOIs'],
    })
  })
});

export const {
  useGetLOIsQuery,
  useGetLOIByIdQuery,
  usePutLOIMutation,
  usePostLOIMutation,
  useDeleteLOIMutation,
} = loisAPI;