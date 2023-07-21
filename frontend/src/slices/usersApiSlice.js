import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/create`,
        method: 'POST',
        body: data,
      }),
    }),
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
    updateUserPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/updatePassword`,
        method: 'POST',
        body: data,
      }),
    }),
    showUsers: builder.query({
      query: ({ userData, userName, userRole, userStatus }) => ({
        url: `${USERS_URL}/?userData=${userData}&userName=${userName}&userRole=${userRole}&userStatus=${userStatus}`,
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
    getProfileUser: builder.query({
      query: () => `${USERS_URL}/profileUser`
    }),
    updateProfileUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profileUser`,
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
  useCreateUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateUserPasswordMutation,
  useShowUsersQuery,
  useGetUserRolesQuery,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useGetProfileUserQuery,
  useUpdateProfileUserMutation,
  useLockUserMutation,
  useUnlockUserMutation,
} = userApiSlice;