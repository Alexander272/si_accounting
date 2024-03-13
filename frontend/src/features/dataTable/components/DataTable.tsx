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
			maxHeight={800}
			display={'flex'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<DataHeader />

			{/* //TODO если на странице 100 строк все начинает тупить при переключении страниц или при открытии контекстного меню (при открытии происходит рендер всей таблицы, что очень долго) 
			
			еще надо наверное пересмотреть определение активного состояния строки (надо подумать как получать меньше рендеров)
			*/}

			<TableContainer sx={{ maxHeight: 640, height: '100%', flexGrow: 1 }}>
				<Table stickyHeader size='small'>
					<DataTableHead />
					<DataTableBody />
				</Table>
			</TableContainer>

			<DataFooter />
		</Box>
	)
}
