import React, { useEffect, useState } from 'react'
import { Button, FormContainer, Alert } from 'components/ui'
import useTimeOutMessage from 'utils/hooks/useTimeOutMessage'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from 'utils/hooks/useAuth'
import googleSvg from 'assets/svg/Google.svg';
import supabaseClient from 'utils/supabaseClient';
import { suspend } from 'suspend-react'

const validationSchema = Yup.object().shape({
	userName: Yup.string().required('Please enter your user name'),
	password: Yup.string().required('Please enter your password'),
	rememberMe: Yup.bool()
})

const SignInForm = props => {

	const [user, setUser] = useState();

	const { 
		disableSubmit = false, 
		className, 
	} = props

	const [message, setMessage] = useTimeOutMessage()

	const { googleSignin } = useAuth()

	const onSignIn = async (setSubmitting) => {
		setSubmitting(true)
		
		const result = await googleSignin()

		if (result.status === 'failed') {
			setMessage(result.message)
		}

		setSubmitting(false)
	}

	useEffect(() => {
		const authUser = suspend(async () => {
			return supabaseClient.auth.user();
		}, []);
		setUser(authUser);
		
	}, [])
	
	//console.log(user);

	return (
		<div className={className}>
			{message && <Alert className="mb-4" type="danger" showIcon>{message}</Alert>}
			<Formik
				initialValues={{
					userName: '', 
					password: '', 
					rememberMe: true 
				}}
				validationSchema={validationSchema}
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
								{ isSubmitting ? 'Signing in...' : 'Sign In With Google' }
							</Button>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default SignInForm