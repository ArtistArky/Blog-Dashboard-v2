import { createSlice } from '@reduxjs/toolkit'

export const initialState = [];

export const categorySlice = createSlice({
	name: 'userData/category',
	initialState,
	reducers: {
        setCategoryData: (_, action) => action.payload,
        deleteCategoryData: (state, action) => {
			const findIndex = state.findIndex(a => a.id === action.payload.id)
			state.splice(findIndex, 1)
        },
        setEmptyC: () => initialState,
	},
})

export const { setCategoryData, setEmptyC, deleteCategoryData } = categorySlice.actions

export default categorySlice.reducer