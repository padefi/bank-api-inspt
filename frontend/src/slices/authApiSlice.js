import { apiSlice } from './apiSlice';

const AUTH_URL = '/api/auth';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkCookies: builder.query({
      query: () => ({
        url: `${AUTH_URL}/check-cookies`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
  }),
});

export const { useCheckCookiesQuery } = authApiSlice;