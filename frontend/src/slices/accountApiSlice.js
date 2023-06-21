import { apiSlice } from './apiSlice';
const ACCOUNTS_URL = '/api/accounts';

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showAccounts: builder.query({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
    useShowAccountsQuery
} = accountApiSlice;