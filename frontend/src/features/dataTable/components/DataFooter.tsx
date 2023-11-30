import { useAppSelector } from '@/hooks/redux'
import { useGetAllSIQuery } from '../siApiSlice'
import { getSelectedItems, getTableFilter, getTableLimit, getTablePage, getTableSort } from '../dataTableSlice'
import { Stack, Typography } from '@mui/material'
import { Pagination } from './Pagination/Pagination'

export const DataFooter = () => {
	const page = useAppSelector(getTablePage)
	const limit = useAppSelector(getTableLimit)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selected = useAppSelector(getSelectedItems)

	const { data } = useGetAllSIQuery({ page, limit, sort, filter })

	return (
		<Stack direction={'row'} alignItems={'center'} mt={2} mx={3}>
			<Typography>Строк выбрано: {selected.length}</Typography>

			{/* //TODO место для элемента пагинации */}
			<Pagination totalPages={Math.ceil((data?.total || 1) / limit)} />

			<Typography sx={{ ml: 'auto' }}>
				{(page - 1) * limit || 1}-{(page - 1) * limit + (data?.data.length || 0)} из {data?.total}
			</Typography>
		</Stack>
	)
}
