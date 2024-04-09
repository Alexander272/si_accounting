import { useAppSelector } from '@/hooks/redux'
import { useGetAllSIQuery } from '../siApiSlice'
import { getSelectedItems, getTableFilter, getTablePage, getTableSize, getTableSort } from '../dataTableSlice'
import { Stack, Typography } from '@mui/material'
import { Pagination } from './Pagination/Pagination'
import { Limit } from './Limit'

export const DataFooter = () => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selected = useAppSelector(getSelectedItems)

	const { data } = useGetAllSIQuery({ page, size, sort, filter })

	return (
		<Stack direction={'row'} alignItems={'center'} mt={2} mx={3}>
			<Typography>Строк выбрано: {selected.length}</Typography>

			<Pagination totalPages={Math.ceil((data?.total || 1) / size)} />

			{data?.data.length ? (
				<>
					<Limit total={data.total || 1} />
					<Typography sx={{ ml: 2 }}>
						{(page - 1) * size || 1}-{(page - 1) * size + (data?.data.length || 0)} из {data?.total}
					</Typography>
				</>
			) : null}
		</Stack>
	)
}
