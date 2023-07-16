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
    showUsers: builder.query({
      query: ({ userData, userName, userType, userStatus }) => ({
        url: `${USERS_URL}/?userData=${userData}&userName=${userName}&userType=${userType}&userStatus=${userStatus}`,
        method: 'GET',
      }),
    }),
    getUserRoles: builder.query({
      query: () => `${USERS_URL}/roles`,
    }),
    getUserProfile: builder.query({
      query: ({ id }) => ({
        url: `${USERS_URL}/profile?id=${id}`,
        method: 'GET',
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
  useShowUsersQuery,
  useGetUserRolesQuery,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useLockUserMutation,
  useUnlockUserMutation,
} = userApiSlice;