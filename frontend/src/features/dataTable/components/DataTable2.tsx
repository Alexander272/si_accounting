import { Box } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
// import { Table } from '@/components/Table/Table'
// import { HeadCells } from './DataTableHead/columns'
import { DataHeader } from './DataHeader'
import { DataFooter } from './DataFooter'
// import { CustomHeader } from './CustomHeader/CustomHeader'
import { getTableFilter, getTablePage, getTableSize, getTableSort } from '../dataTableSlice'
import { useGetAllSIQuery } from '../siApiSlice'
import { Table } from './Table/Table'

export const DataTable2 = () => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const { isFetching } = useGetAllSIQuery({ page, size, sort, filter }, { pollingInterval: 5 * 60000 })

	return (
		<Box
			borderRadius={3}
			padding={2}
			width={'100%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			flexGrow={1}
			maxHeight={800}
			display={'flex'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<DataHeader />

			{/* <Table
				columns={HeadCells}
				data={data?.data || []}
				itemCount={size}
				loading={isFetching}
				header={<CustomHeader />}
			/> */}
			<Table loading={isFetching} />

			<DataFooter />
		</Box>
	)
}
