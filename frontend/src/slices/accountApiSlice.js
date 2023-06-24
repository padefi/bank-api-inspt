import { apiSlice } from './apiSlice';
const ACCOUNTS_URL = '/api/accounts';

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showAccounts: builder.query({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/`
      }),
    }),
    showAccount: builder.query({
      query: ({ id }) => ({
        url: `${ACCOUNTS_URL}/getUserAccount?id=${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
    useShowAccountsQuery,
    useShowAccountQuery
} = accountApiSlice;