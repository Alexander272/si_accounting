import { Box, LinearProgress } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { getTableFilter, getTableLimit, getTablePage, getTableSort } from '../dataTableSlice'
import { useGetAllSIQuery } from '../siApiSlice'

export const DataTableLoader = () => {
	const page = useAppSelector(getTablePage)
	const limit = useAppSelector(getTableLimit)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const { isFetching } = useGetAllSIQuery({ page, limit, sort, filter }, { pollingInterval: 5 * 60000 })

	if (!isFetching) return null

	return (
		<Box position={'absolute'} width={'100%'} zIndex={5} bottom={-75}>
			<LinearProgress />
		</Box>
	)
}
