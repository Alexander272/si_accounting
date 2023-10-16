import { Box, Table, TableContainer } from '@mui/material'

import { DataTableHead } from './DataTableHead'
import { DataTableBody } from './DataTableBody'

export const DataTable = () => {
	return (
		<Box
			borderRadius={3}
			padding={2}
			width={'100%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			{/* //TODO header */}
			<Box height={'30px'}></Box>

			<TableContainer>
				<Table stickyHeader>
					<DataTableHead />
					<DataTableBody />
				</Table>
			</TableContainer>

			{/* //TODO footer */}
			<Box height={'20px'}></Box>
		</Box>
	)
}
