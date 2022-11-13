import React, { useEffect, useState } from 'react'
import { Button, FormContainer, Alert } from 'components/ui'
import useTimeOutMessage from 'utils/hooks/useTimeOutMessage'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from 'utils/hooks/useAuth'
import googleSvg from 'assets/svg/Google.svg'
import supabaseClient from 'utils/supabaseClient'
import appConfig from 'configs/app.config'
import { onSignInSuccess, onSignOutSuccess } from 'store/auth/sessionSlice'
import { setUser } from 'store/auth/userSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';

const validationSchema = Yup.object().shape({
	userName: Yup.string().required('Please enter your user name'),
	password: Yup.string().required('Please enter your password'),
	rememberMe: Yup.bool()
})

const SignInForm = props => {

    const dispatch = useDispatch()

    const navigate = useNavigate()

	//const [user, setUser] = useState();

	const { 
		disableSubmit = false, 
		className, 
	} = props

	const [message, setMessage] = useTimeOutMessage()

	const { googleSignin } = useAuth()

	const onSignIn = async (values, setSubmitting) => {
		console.log('Insignin')
		setSubmitting(true)
		
		const result = await googleSignin()

		if (result.status === 'failed') {
			setMessage(result.message)
		}

		setSubmitting(false)
	}

	useEffect(() => {
		const getAuthUser = async () => {
			const user = await supabaseClient.auth.user();
			const session = await supabaseClient.auth.session();
			return {user, session};
		}
		getAuthUser().then((res) => {
			if(res.user == null) {
				setUser(null);
				console.log(res.user);
			}else {
				console.log(res.user);
				const { access_token, provider_token } = res.session
				dispatch(onSignInSuccess({
					access_token, 
					provider_token
				}))
				if(res.user) {
					const userData = {
						id: res.user.id,
						...res.user.user_metadata,
						authority: ['USER'], 
					}
					dispatch(setUser(userData || { 
						avatar: '', 
						userName: 'Anonymous', 
						authority: ['USER'], 
						email: ''
					}))
				}
				//const redirectUrl = query.get(REDIRECT_URL_KEY)
				navigate(appConfig.authenticatedEntryPath)
			}
		});
		
	}, [])

	//console.log(user);

	return (
		<div className={`overflow-x-hidden ${className}`}>
			{message && <Alert className="mb-4" type="danger" showIcon>{message}</Alert>}
			<Formik
				initialValues={{
					userName: '', 
					password: '', 
					rememberMe: true 
				}}
				onSubmit={(values, { setSubmitting }) => {
					if(!disableSubmit) {
						onSignIn(values, setSubmitting)
					} else {
						setSubmitting(false)
					}
				}}
			>
				{({touched, errors, isSubmitting}) => (
					<Form>
						<FormContainer>
							{/* <FormItem
								label="User Name"
								invalid={errors.userName && touched.userName}
								errorMessage={errors.userName}
							>
								<Field 
									type="text" 
									autoComplete="off" 
									name="userName" 
									placeholder="User Name" 
									component={Input} 
								/>
							</FormItem>
							<FormItem
								label="Password"
								invalid={errors.password && touched.password}
								errorMessage={errors.password}
							>
								<Field
									autoComplete="off" 
									name="password" 
									placeholder="Password" 
									component={PasswordInput} 
								/>
							</FormItem>
							<div className="flex justify-between mb-6">
								<Field className="mb-0" name="rememberMe" component={Checkbox} children="Remember Me" />
								<ActionLink to={forgotPasswordUrl}>
									Forgot Password?
								</ActionLink>
							</div>
							<Button block loading={isSubmitting} variant="solid" type="submit">
								{ isSubmitting ? 'Signing in...' : 'Sign In' }
							</Button>
							<div className="mt-4 text-center">
								<span>Don't have an account yet? </span>
								<ActionLink to={signUpUrl}>
									Sign up
								</ActionLink>
							</div> */}
							<Button block loading={isSubmitting} icon={<img
								className="flex-shrink-0"
								src={googleSvg}
								alt={'Google'}
								/>} type="submit">
								Sign In With Google
							</Button>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default SignInForm