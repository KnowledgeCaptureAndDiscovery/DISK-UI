import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_DISK_API } from "config";
import { DataEndpoint, Vocabularies } from 'DISK/interfaces';
import { DISK } from './DISK';

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
    queryExternalSource: builder.query<{[varName:string] : string[]}, {dataSource:string, query:string, variables:string[]}>({
      query: ({dataSource,query,variables}) => `externalQuery?${
        new URLSearchParams({
            endpoint: dataSource,
            query: query,
            variables: variables.length === 0 ? "*" : variables.join(" ")
        })
      }`,
    }),
    getPublicFile: builder.query<string, string>({
      query: (path:string) => `https://s3.mint.isi.edu/neurodisk/${path}`,
    }),
    getPrivateFile: builder.query<string, {dataSource:string, dataId:string}>({
      query: ({ dataSource, dataId }) => ({
        url: `getData`,
        headers: DISK.headers,
        method: 'POST',
        body: {'source':dataSource, 'dataId': dataId.replace(/.*#/,"")},
      }),
    }),
  }),
});
 
export const {
  useGetEndpointsQuery,
  useGetVocabulariesQuery,
  useQueryExternalSourceQuery,
  useGetPrivateFileQuery,
  useGetPublicFileQuery,
} = serverApi;