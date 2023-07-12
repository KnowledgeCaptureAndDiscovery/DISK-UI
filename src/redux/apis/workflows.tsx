import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { Method, MethodVariables } from 'DISK/interfaces';

export const workflowsApi = createApi({
  reducerPath: 'workflows',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_DISK_API,
  }),
  endpoints: (builder) => ({
    getWorkflows: builder.query<Method[], void>({
      query: () => 'workflows',
    }),
    getWorkflowVariables: builder.query<MethodVariables[], {id:string, source:string}>({
      query: ({id, source}) => `workflows/${source}/${id}`,
    }),
  }),
});
 
export const {
  useGetWorkflowsQuery,
  useGetWorkflowVariablesQuery,
} = workflowsApi;