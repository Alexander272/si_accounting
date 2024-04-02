import { Box, LinearProgress } from '@mui/material'

export const FormLoader = () => {
	return (
		<Box position={'absolute'} width={'100%'} left={0} bottom={0}>
			<LinearProgress />
		</Box>
	)
}
