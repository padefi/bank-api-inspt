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
    userRole: builder.query({
      query: () => ({
        url: `${AUTH_URL}/role`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useCheckCookiesQuery, useUserRoleQuery } = authApiSlice;