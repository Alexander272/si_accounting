import { Box, LinearProgress } from '@mui/material'

import { useGetAllSI } from '../hooks/getAllSI'

export const DataTableLoader = () => {
	const { isFetching } = useGetAllSI()

	if (!isFetching) return null

	return (
		<Box position={'absolute'} width={'100%'} zIndex={5} bottom={-75}>
			<LinearProgress />
		</Box>
	)
}
