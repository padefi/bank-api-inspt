import { apiSlice } from './apiSlice';
const OPERATIONS_URL = '/api/operations';

export const operationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showAllOperations: builder.query({
      query: ({ id }) => ({
        url: `${OPERATIONS_URL}/allOperations?id=${id}`,
        method: 'GET',
      }),
    }),
    showOperations: builder.query({
      query: ({ accountId }) => ({
        url: `${OPERATIONS_URL}/operations?accountId=${accountId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useShowAllOperationsQuery,
  useShowOperationsQuery
} = operationApiSlice;