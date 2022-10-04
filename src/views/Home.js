import React from 'react'
import { Button } from 'components/ui'
import useAuth from 'utils/hooks/useAuth'

const Home = () => {
	const { googlesignOut } = useAuth()

	return (
		<div>Test
			
			<Button block onClick={googlesignOut} variant="solid" type="submit">
				Signout
			</Button>
		</div>
		
	)
}

export default Home