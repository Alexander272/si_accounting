import { lazy, Suspense } from 'react'
import { Box } from '@mui/material'

// import { Table } from '@/components/Table/Table'
// import { HeadCells } from './DataTableHead/columns'
import { DataHeader } from './DataHeader'
import { DataFooter } from './DataFooter'
import { Fallback } from '@/components/Fallback/Fallback'
// import { CustomHeader } from './CustomHeader/CustomHeader'

const Table = lazy(() => import('./Table/Table'))

// type Props = {
// 	status?: SIStatus
// }

export default function DataTable() {
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
			<Suspense fallback={<Fallback />}>
				<Table />
			</Suspense>

			<DataFooter />
		</Box>
	)
}
