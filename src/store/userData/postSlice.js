import { createSlice } from '@reduxjs/toolkit'

export const initialState = [];

export const postSlice = createSlice({
	name: 'userData/posts',
	initialState,
	reducers: {
        setPostsData: (_, action) => action.payload,
        deletePostData: (state, action) => {
			const findIndex = state.findIndex(a => a.posttitle === action.payload.posttitle)
			state.splice(findIndex, 1)
        },
        setEmpty: () => initialState,
	},
})

export const { setPostsData, setEmpty, deletePostData } = postSlice.actions

export default postSlice.reducer