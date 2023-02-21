import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId: '',
    name: '',
    email: '',
    emailVerification: '',
    userStatus: '',
    sessionId: '',
    sessionExpiry: ''
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, { payload }) => {
            return payload
        },
        resetUser: (state) => {
            return initialState
        }
    }
})

export const { setUser, resetUser } = authSlice.actions
export default authSlice.reducer