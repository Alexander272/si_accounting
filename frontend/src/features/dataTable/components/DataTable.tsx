import { Box, Table, TableContainer } from '@mui/material'

import { DataTableHead } from './DataTableHead/DataTableHead'
import { DataTableBody } from './DataTableBody'
import { DataHeader } from './DataHeader'
import { DataFooter } from './DataFooter'

export const DataTable = () => {
	return (
		<Box
			borderRadius={3}
			padding={2}
			width={'100%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			flexGrow={1}
			display={'flex'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<DataHeader />

			<TableContainer sx={{ maxHeight: 600, flexGrow: 1 }}>
				<Table stickyHeader size='small'>
					<DataTableHead />
					<DataTableBody />
				</Table>
			</TableContainer>

			<DataFooter />
		</Box>
	)
}
