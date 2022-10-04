import React from 'react'
import SignInForm from './SignInForm'

const SignIn = () => {
	return (
		<>
			<div className="mb-8">
				<h3 className="mb-1">Login</h3>
				<p>Enter the world of your creativity!</p>
			</div>
			<SignInForm disableSubmit={false} />
		</>
	)
}

export default SignIn