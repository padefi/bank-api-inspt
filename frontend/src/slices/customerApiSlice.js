import { apiSlice } from './apiSlice';
const CUSTOMERS_URL = '/api/customers';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (data) => ({
        url: `${CUSTOMERS_URL}/create`,
        method: 'POST',
        body: data,
      }),
    }),
    showCustomers: builder.query({
      query: ({ accountHolder, governmentId, customerTypes, accountStatus }) => ({
        url: `${CUSTOMERS_URL}/?accountHolder=${accountHolder}&governmentId=${governmentId}&customerTypes=${customerTypes}&accountStatus=${accountStatus}`,
        method: 'GET',
      }),
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
  useCreateCustomerMutation,
  useShowCustomersQuery,
  useGetCustomerProfileQuery,
  useUpdateCustomerMutation,
} = customerApiSlice;