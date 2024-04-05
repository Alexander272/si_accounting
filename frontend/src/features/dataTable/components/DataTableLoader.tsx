import { Box, LinearProgress } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { getTableFilter, getTableSize, getTablePage, getTableSort } from '../dataTableSlice'
import { useGetAllSIQuery } from '../siApiSlice'

export const DataTableLoader = () => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const { isFetching } = useGetAllSIQuery(
		{ page, size, sort, filter: filter ? [filter] : [] },
		{ pollingInterval: 5 * 60000 }
	)

	if (!isFetching) return null

	return (
		<Box position={'absolute'} width={'100%'} zIndex={5} bottom={-75}>
			<LinearProgress />
		</Box>
	)
}
