import { combineReducers } from '@reduxjs/toolkit'
import author from './authorSlice'

const reducer = combineReducers({
    author,
})

export default reducer