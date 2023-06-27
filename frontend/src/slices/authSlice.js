import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
};

const authSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        logout: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
        userMessage: (state, action) => {
            state.userMessage = action.payload;
            localStorage.setItem('userMessage', JSON.stringify(action.payload));
        },
    },
});

export const { setCredentials, logout, userMessage } = authSlice.actions;

export default authSlice.reducer;