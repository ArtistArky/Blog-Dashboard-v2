import { combineReducers } from '@reduxjs/toolkit'
import author from './authorSlice'
import posts from './postSlice'
import category from './categorySlice'

const reducer = combineReducers({
    author,
    posts,
    category,
})

export default reducer