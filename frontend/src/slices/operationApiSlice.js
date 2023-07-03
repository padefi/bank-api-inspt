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
      query: ({ id }) => ({
        url: `${OPERATIONS_URL}/accountOperations?id=${id}`,
        method: 'GET',
      }),
    }),
    depositMoney: builder.mutation({
      query: (data) => ({
        url: `${OPERATIONS_URL}/deposit`,
        method: 'POST',
        body: data,
      }),
    }),
    withdrawMoney: builder.mutation({
      query: (data) => ({
        url: `${OPERATIONS_URL}/withdraw`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useShowAllOperationsQuery,
  useShowOperationsQuery,
  useDepositMoneyMutation,
  useWithdrawMoneyMutation,
} = operationApiSlice;