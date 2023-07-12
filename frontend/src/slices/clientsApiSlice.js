import { apiSlice } from './apiSlice';
const CUSTOMERS_URL = '/api/customers';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    showCustomers: builder.query({
      query: () => `${CUSTOMERS_URL}/`,
    }),
  }),
});

export const {
  useShowCustomersQuery,
} = customerApiSlice;