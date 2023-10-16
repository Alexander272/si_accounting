import { Container } from '@mui/material'

import { Loader } from './Loader'

export const Fallback = () => {
	return (
		<Container sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<Loader />
		</Container>
	)
}
