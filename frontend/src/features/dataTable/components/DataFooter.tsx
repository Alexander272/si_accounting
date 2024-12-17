import { useAppSelector } from '@/hooks/redux'
import { Stack, Typography } from '@mui/material'

import { useGetAllSI } from '../hooks/getAllSI'
import { getSelected, getTablePage, getTableSize } from '../dataTableSlice'
import { Pagination } from './Pagination/Pagination'
import { TableSize } from './TableSize'

export const DataFooter = () => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const selected = useAppSelector(getSelected)

	const { data } = useGetAllSI()

	return (
		<Stack direction={'row'} alignItems={'center'} mt={2} mx={3}>
			<Typography>Строк выбрано: {Object.keys(selected).length}</Typography>

			<Pagination totalPages={Math.ceil((data?.total || 1) / size)} />

			{data?.data.length ? (
				<>
					<TableSize total={data.total || 1} />
					<Typography sx={{ ml: 2 }}>
						{(page - 1) * size || 1}-{(page - 1) * size + (data?.data.length || 0)} из {data?.total}
					</Typography>
				</>
			) : null}
		</Stack>
	)
}
