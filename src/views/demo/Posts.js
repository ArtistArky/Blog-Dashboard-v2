import React from 'react'
import { Container, AdaptableCard } from 'components/shared'
import Articles from './Articles'
import PanelHeader from './PanelHeader'

/** Example purpose only */
const Posts = () => {
	return (
		<Container>
			<PanelHeader type="Posts" title="Manage Posts" />
			<Articles />
		</Container>
	)
}

export default Posts