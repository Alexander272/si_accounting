import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material'
import { getTableLimit, setLimit } from '../dataTableSlice'

const limits = [15, 30, 50, 100]

export const Limit = () => {
	const limit = useAppSelector(getTableLimit)

	const dispatch = useAppDispatch()

	const changeLimit = (event: SelectChangeEvent<number>) => {
		dispatch(setLimit(+event.target.value))
	}

	return (
		<Stack ml={'auto'} direction={'row'} alignItems={'center'}>
			<Typography>Строк на странице:</Typography>

			<Select
				value={limit}
				onChange={changeLimit}
				sx={{
					boxShadow: 'none',
					'.MuiOutlinedInput-notchedOutline': { border: 0 },
					'&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
						border: 0,
					},
					'&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
						border: 0,
					},
					'.MuiOutlinedInput-input': { padding: '6.5px 10px' },
				}}
			>
				{limits.map(l => (
					<MenuItem key={l} value={l}>
						{l}
					</MenuItem>
				))}
			</Select>
		</Stack>
	)
}
