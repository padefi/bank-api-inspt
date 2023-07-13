import { apiSlice } from './apiSlice';
const CUSTOMERS_URL = '/api/customers';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showCustomers: builder.query({
      query: () => `${CUSTOMERS_URL}/`,
    }),
    getCustomerProfile: builder.query({
      query: ({ id }) => ({
        url: `${CUSTOMERS_URL}/profile?id=${id}`,
        method: 'GET',
      }),
    }),
    updateCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useShowCustomersQuery,
  useGetCustomerProfileQuery,
  useUpdateCustomerMutation,
} = customerApiSlice;