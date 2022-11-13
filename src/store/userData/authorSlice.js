import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
    id: '',
    username: null,
    posts: 0,
    category: 0,
    created_at: '',
    email: '',
    full_name: '',
    avatar_url: '',
    href: '',
    title: '',
    description: '',
    logoimg: '',
    faviconimg: '',
    onboard: false,
    aurl: '',
}

export const authorSlice = createSlice({
	name: 'userData/author',
	initialState,
	reducers: {
        setAuthorData: (_, action) => action.payload,
        updateAuthorData: (state, action) => {
            state.title = action.payload.title
            state.description = action.payload.description
            state.username = action.payload.username
            state.logoimg = action.payload.logoimg
            state.faviconimg = action.payload.faviconimg
            state.aurl = action.payload.aurl
        },
        updateAuthorPosts: (state, action) => {
            state.posts = action.payload
        },
        updateAuthorCategory: (state, action) => {
            state.category = action.payload
        },
        updateOnboard: (state, action) => {
            state.onboard = action.payload
        },
        setEmptyA: () => initialState,
	},
})

export const { setAuthorData, updateAuthorData, updateAuthorPosts, updateAuthorCategory, updateOnboard, setEmptyA } = authorSlice.actions

export default authorSlice.reducer