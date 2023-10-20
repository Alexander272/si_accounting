import { Box, Button, Stack, SvgIcon, Table, TableContainer, Typography, useTheme } from '@mui/material'

import { useModal } from '@/features/modal/hooks/useModal'
import { DataTableHead } from './DataTableHead/DataTableHead'
import { DataTableBody } from './DataTableBody'

export const DataTable = () => {
	const { palette } = useTheme()
	const { openModal } = useModal()

	const openHandler = () => {
		openModal('CreateDataItem')
	}

	return (
		<Box
			borderRadius={3}
			padding={2}
			width={'100%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<Stack direction={'row'} spacing={2} paddingX={3} paddingY={2}>
				<Typography color={'primary'} variant='h5'>
					Средства измерения
				</Typography>

				<Button
					onClick={openHandler}
					variant='outlined'
					sx={{ borderWidth: 2, borderRadius: 3, minWidth: 54, ':hover': { borderWidth: 2 } }}
				>
					<SvgIcon sx={{ fontSize: 14, fill: palette.primary.main }}>
						<svg
							x='0px'
							y='0px'
							viewBox='0 0 122.875 122.648'
							enableBackground='new 0 0 122.875 122.648'
							xmlSpace='preserve'
						>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M108.993,47.079c7.683-0.059,13.898,6.12,13.882,13.805 c-0.018,7.683-6.26,13.959-13.942,14.019L75.24,75.138l-0.235,33.73c-0.063,7.619-6.338,13.789-14.014,13.78 c-7.678-0.01-13.848-6.197-13.785-13.818l0.233-33.497l-33.558,0.235C6.2,75.628-0.016,69.448,0,61.764 c0.018-7.683,6.261-13.959,13.943-14.018l33.692-0.236l0.236-33.73C47.935,6.161,54.209-0.009,61.885,0 c7.678,0.009,13.848,6.197,13.784,13.818l-0.233,33.497L108.993,47.079L108.993,47.079z'
							/>
						</svg>
					</SvgIcon>
				</Button>
			</Stack>

			<TableContainer>
				<Table stickyHeader size='small'>
					<DataTableHead />
					<DataTableBody />
				</Table>
			</TableContainer>

			{/* //TODO footer */}
			<Box height={'20px'}></Box>
		</Box>
	)
}