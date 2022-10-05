import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
    blog_name: '',
    title: '',
    description: '',
    logoimg: null,
    faviconimg: null,
}

export const onboardSlice = createSlice({
	name: 'onboard',
	initialState,
	reducers: {
        stepOne: (state, action) => {
            state.blog_name = action.payload.blogName
            state.title = action.payload.title
        },
        stepTwo: (state, action) => {
            state.description = action.payload.description
            state.logoimg = action.payload.logoimg
            state.faviconimg = action.payload.faviconimg
        },
        clearSteps: () => initialState,
	},
})

export const { stepOne, stepTwo, clearSteps } = onboardSlice.actions

export default onboardSlice.reducer