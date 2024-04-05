import Box from '@mui/material/Box'

import StyledGridOverlay from '../StyledGridOverlay'

import EmptyIcon from './EmptyIcon'

function DataTableNoRowsOverlay(): JSX.Element {
	return (
		<StyledGridOverlay>
			<EmptyIcon />
			<Box mt={1} color='text.secondary'>
				Не найдено ни одной позиции
			</Box>
		</StyledGridOverlay>
	)
}

export default DataTableNoRowsOverlay
