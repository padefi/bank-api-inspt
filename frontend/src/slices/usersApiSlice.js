import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    lockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/lock`,
        method: 'POST',
        body: data,
      }),
    }),
    unlockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/unlock`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useUpdateUserMutation,
  useLockUserMutation,
  useUnlockUserMutation,
} = userApiSlice;