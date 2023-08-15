import { FetchBaseQueryMeta, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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
    queryExternalSource: builder.query<{[varName:string] : string[]}, {dataSource:DataEndpoint, query:string, variables:string[]}>({
      query: ({dataSource,query,variables}) => `externalQuery?${
        new URLSearchParams({
            endpoint: dataSource.url,
            query: query,
            variables: variables.length === 0 ? "*" : variables.join(" ")
        })
      }`,
      transformResponse: (returnValue: { [varName: string]: string[]; } , meta: FetchBaseQueryMeta | undefined, arg: { dataSource: DataEndpoint; query: string; variables: string[]; }) => {
        // If the data source has a prefix resolution, we replace it over the prefix.
        if (returnValue && arg.dataSource.prefix && arg.dataSource.namespace && arg.dataSource.prefixResolution) {
          Object.keys(returnValue).forEach((varName: string) => {
            let newValues: string[] = [];
            returnValue[varName].forEach((val) =>
              newValues.push(
                val.replace(arg.dataSource.namespace, arg.dataSource.prefixResolution)
              )
            );
            returnValue[varName] = newValues;
          });
        }
        return returnValue;
      }
    }),
    getPublicFile: builder.query<string, string>({
      query: (path:string) => ({
        url: `https://s3.mint.isi.edu/neurodisk/${path}`,
        responseHandler: (response) => response.text(),
      }),
    }),
    getPrivateFileAsText: builder.query<string, {dataSource:string, dataId:string}>({
      query: ({ dataSource, dataId }) => ({
        url: `getData`,
        headers: DISK.headers,
        method: 'POST',
        body: {'source':dataSource, 'dataId': dataId.replace(/.*#/,"")},
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});
 
export const {
  useGetEndpointsQuery,
  useGetVocabulariesQuery,
  useQueryExternalSourceQuery,
  useGetPrivateFileAsTextQuery,
  useLazyGetPrivateFileAsTextQuery,
  useGetPublicFileQuery,
  useLazyGetPublicFileQuery,
} = serverApi;