import React, { useEffect } from 'react'
import { Button } from 'components/ui'
import useAuth from 'utils/hooks/useAuth'
import Welcome from './pages/Welcome'
import { useDispatch, useSelector } from 'react-redux'
import { clearSteps } from 'store/onboard/onboardSlice'

const Home = () => {
	const { googlesignOut } = useAuth()
	var onboardStatus = useSelector((state) => state.userData.author.onboard)

    const dispatch = useDispatch()

	useEffect(() => {
		if(onboardStatus == false) {
			dispatch(clearSteps())
		}
	}, [])
	
	
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