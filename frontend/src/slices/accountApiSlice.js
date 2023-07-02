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
    changeAlias: builder.mutation({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/changeAlias`,
        method: 'POST',
        body: data,
      }),
    }),
    closeAccount: builder.mutation({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/close`,
        method: 'POST',
        body: data,
      }),
    }),
    activeAccount: builder.mutation({
      query: (data) => ({
        url: `${ACCOUNTS_URL}/active`,
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
  useChangeAliasMutation,
  useCloseAccountMutation,
  useActiveAccountMutation,
} = accountApiSlice;