import React from 'react'
import { Button } from 'components/ui'
import useAuth from 'utils/hooks/useAuth'
import Welcome from './pages/Welcome'
import { useSelector } from 'react-redux';

const Home = () => {
	const { googlesignOut } = useAuth()
	var onboardStatus = useSelector((state) => state.userData.author.onboard)

	return (
		<div>
			{
				onboardStatus == false ? 
				<Welcome />
				:
				<div>
					Test
				</div>
			}
			{/* <Button block onClick={googlesignOut} variant="solid" type="submit">
				Signout
			</Button> */}
		</div>
		
	)
}

export default Home