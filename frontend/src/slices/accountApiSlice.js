import { apiSlice } from './apiSlice';
const ACCOUNTS_URL = '/api/accounts';

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showAccounts: builder.query({
      query: () => `${ACCOUNTS_URL}/`,
    }),
    getAccount: builder.query({
      query: ({ id }) => ({
        url: `${ACCOUNTS_URL}/getUserAccount?id=${id}`,
        method: 'GET',
      }),
    }),
    getCurrencies: builder.query({
      query: () => `${ACCOUNTS_URL}/getCurrencies`,
    }),
    createAccount: builder.mutation({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/create`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useShowAccountsQuery,
  useGetAccountQuery,
  useGetCurrenciesQuery,
  useCreateAccountMutation,
} = accountApiSlice;