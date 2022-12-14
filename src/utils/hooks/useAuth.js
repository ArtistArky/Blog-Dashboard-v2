import { useSelector, useDispatch } from 'react-redux'
import { setUser, initialState } from 'store/auth/userSlice'
import { apiSignIn, sbGoogleSignin, apiSignOut, sbGoogleSignOut } from 'services/AuthService'
import { onSignInSuccess, onSignOutSuccess } from 'store/auth/sessionSlice'
import appConfig from 'configs/app.config'
import { REDIRECT_URL_KEY } from 'constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import { setEmptyA } from 'store/userData/authorSlice'
import { setEmpty } from 'store/userData/postSlice'
import { setEmptyC } from 'store/userData/categorySlice'
import { setEmptyN } from 'store/userData/navSlice'

function useAuth() {

    const dispatch = useDispatch()

    const navigate = useNavigate()

	const query = useQuery()

    const { token, signedIn } = useSelector((state) => state.auth.session)

    const signIn = async ({ userName, password }) => {
        try {
			const resp = await apiSignIn({ userName, password })
			if (resp.data) {
				const { token } = resp.data
				dispatch(onSignInSuccess(token))
				if(resp.data.user) {
					dispatch(setUser(resp.data.user || { 
						avatar: '', 
						userName: 'Anonymous', 
						authority: ['USER'], 
						email: ''
					}))
				}
				const redirectUrl = query.get(REDIRECT_URL_KEY)
				navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath)
                return {
                    status: 'success',
                    message: ''
                }
			}
		} catch (errors) {
			return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString()
            }
		}
    }

    const googleSignin = async () => {
        try {
			const resp = await sbGoogleSignin()
			if(resp.error) {
				return {
					status: 'failed',
					message: resp.error?.message || resp.error.toString()
				}
			}
			if (resp.data) {
				console.log(resp.data)
				// const { access_token } = resp.session
				// dispatch(onSignInSuccess(access_token))
				// if(resp.user) {
				// 	dispatch(setUser(resp.user || { 
				// 		avatar: '', 
				// 		userName: 'Anonymous', 
				// 		authority: ['USER'], 
				// 		email: ''
				// 	}))
				// }
				// //const redirectUrl = query.get(REDIRECT_URL_KEY)
				// navigate(appConfig.authenticatedEntryPath)
                // return {
                //     status: 'success',
                //     message: ''
                // }
			}
		} catch (errors) {
			return {
                status: 'failed',
                message: errors?.message || errors.toString()
            }
		}
    }

    const handleSignOut = ()  => {
		dispatch(setEmptyA())
		dispatch(setEmpty())
		dispatch(setEmptyC())
		dispatch(setEmptyN())
		dispatch(onSignOutSuccess())
		dispatch(setUser(initialState))
		navigate(appConfig.unAuthenticatedEntryPath)
	}

    const googlesignOut = async () => {
		try {
			await sbGoogleSignOut()
			handleSignOut()
		} catch (errors) {
			handleSignOut()
		}
	}

    const signOut = async () => {
		try {
			await apiSignOut()
			handleSignOut()
		} catch (errors) {
			handleSignOut()
		}
	}
    
    return {
        authenticated: token && signedIn,
        signIn,
		googleSignin,
		googlesignOut,
        signOut
    }
}

export default useAuth