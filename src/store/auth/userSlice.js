import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
    id: '',
    avatar_url: '',
    email: '',
    email_verified: false,
    full_name: '',
    iss: '',
    name: '',
    picture: '',
    provider_id: '',
    sub: '',
    authority: []
}

export const userSlice = createSlice({
	name: 'auth/user',
	initialState,
	reducers: {
        setUser: (_, action) => action.payload,
        userLoggedOut: () => initialState,
	},
})

export const { setUser } = userSlice.actions

export default userSlice.reducer