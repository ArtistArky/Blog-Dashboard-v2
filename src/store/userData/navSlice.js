import { createSlice } from '@reduxjs/toolkit'

export const initialState = [];

export const navSlice = createSlice({
	name: 'userData/navigation',
	initialState,
	reducers: {
        setNavData: (_, action) => action.payload,
        deleteNavData: (state, action) => {
			const findIndex = state.findIndex(a => a.id === action.payload.id)
			state.splice(findIndex, 1)
        },
        setEmptyN: () => initialState,
	},
})

export const { setNavData, setEmptyN, deleteNavData } = navSlice.actions

export default navSlice.reducer