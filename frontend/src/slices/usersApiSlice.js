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
    blockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/block`,
        method: 'POST',
        body: data,
      }),
    }),
    activeUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/active`,
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
  useBlockUserMutation,
  useActiveUserMutation,
} = userApiSlice;