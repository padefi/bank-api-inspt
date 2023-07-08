import { apiSlice } from './apiSlice';
const OPERATIONS_URL = '/api/operations';

export const operationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showAllOperations: builder.query({
      query: ({ id, accountFrom }) => ({
        url: `${OPERATIONS_URL}/allOperations?id=${id}&accountFrom=${accountFrom}`,
        method: 'GET',
      }),
    }),
    showAccountOperations: builder.query({
      query: ({ accountFrom }) => ({
        url: `${OPERATIONS_URL}/accountOperations?accountFrom=${accountFrom}`,
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
    transferMoney: builder.mutation({
      query: (data) => ({
        url: `${OPERATIONS_URL}/transfer`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useShowAllOperationsQuery,
  useShowAccountOperationsQuery,
  useShowOperationsQuery,
  useDepositMoneyMutation,
  useWithdrawMoneyMutation,
  useTransferMoneyMutation,
} = operationApiSlice;