import { combineReducers } from '@reduxjs/toolkit'
import author from './authorSlice'
import posts from './postSlice'
import category from './categorySlice'
import navigation from './navSlice'

const reducer = combineReducers({
    author,
    posts,
    category,
    navigation,
})

export default reducer