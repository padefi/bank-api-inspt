import { apiSlice } from './apiSlice';
const OPERATIONS_URL = '/api/operations';

export const operationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showOperations: builder.query({
      query: ({ accountId }) => ({
        url: `${OPERATIONS_URL}/operations?accountId=${accountId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useShowOperationsQuery
} = operationApiSlice;