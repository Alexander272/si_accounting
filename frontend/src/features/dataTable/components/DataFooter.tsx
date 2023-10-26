import { useAppSelector } from '@/hooks/redux'
import { useGetAllSIQuery } from '../siApiSlice'
import { getTableFilter, getTableSort } from '../dataTableSlice'
import { Stack, Typography } from '@mui/material'

export const DataFooter = () => {
	const page = 0
	const limit = 50

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const { data } = useGetAllSIQuery({ sort, filter })

	return (
		<Stack direction={'row'} alignItems={'center'} mt={2} mx={3}>
			<Typography sx={{ ml: 'auto' }}>
				{page * limit + 1}-{page * limit + (data?.data.length || 0)} из {data?.total}
			</Typography>
		</Stack>
	)
}
