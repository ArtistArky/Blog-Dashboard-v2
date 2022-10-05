import { combineReducers } from 'redux'
import theme from './theme/themeSlice'
import onboard from './onboard/onboardSlice'
import auth from './auth'
import base from './base'
import userData from './userData'

const rootReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        theme,
        auth,
        base,
        userData,
        onboard,
        ...asyncReducers,
    })
    return combinedReducer(state, action)
}
  
export default rootReducer
