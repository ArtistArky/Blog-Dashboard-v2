import React from 'react'
import { Button } from 'components/ui'
import { useDispatch } from 'react-redux'

const PanelHeader = ({ type, title, button }) => {

	const dispatch = useDispatch()

	const onAddCategory = () => {
	}

	return (
		<div className="flex items-center justify-between">
			<div>
				<h5>{title}</h5>
			</div>
			{
				button === true && (
					<Button 
						onClick={onAddCategory} 
						size="sm" 
						variant="solid"
					>
						Add {type}
					</Button>
				)
			}
		</div>
	)
}

export default PanelHeader