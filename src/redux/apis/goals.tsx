import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { Goal } from "DISK/interfaces";
import { DISK } from "./DISK";
import { RE_ID } from 'DISK/util';

export const goalAPI = createApi({
  reducerPath: 'goals',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  tagTypes: ['Goals','Goal'],
  endpoints: (builder) => ({
    getGoals: builder.query<Goal[], void>({
      query: () => 'goals',
      providesTags: ['Goals']
    }),
    getGoalById: builder.query<Goal, string>({
      query: (id: string) => `goals/${id.replaceAll(RE_ID, "")}`,
      providesTags: ['Goal']
    }),
    putGoal: builder.mutation<Goal, { data: Partial<Goal> & {id:string}}>({
      query: ({ data }) => ({
        url: `goals/${data.id.replaceAll(RE_ID, "")}`,
        headers: DISK.headers,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),
    postGoal: builder.mutation<Goal, {data: Partial<Goal>}>({
      query: ({ data }) => ({
        url: `goals`,
        headers: DISK.headers,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Goals'],
    }),
    deleteGoal: builder.mutation<Goal, {id:string}>({
      // note: an optional `queryFn` may be used in place of `query`
      query: ({ id }) => ({
        url: `goals/${id.replaceAll(RE_ID, "")}`,
        headers: DISK.headers,
        method: 'DELETE'
      }),
      invalidatesTags: ['Goals'],
    })
  })
});

export const {
  useGetGoalsQuery,
  useGetGoalByIdQuery,
  usePutGoalMutation,
  usePostGoalMutation,
  useDeleteGoalMutation,
} = goalAPI;