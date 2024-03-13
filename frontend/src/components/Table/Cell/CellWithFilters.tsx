import { FC } from 'react'
import { Button, Stack, Tooltip, useTheme } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { getTableSort } from '@/features/dataTable/dataTableSlice'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'
import { SortDownIcon } from '@/components/Icons/SortDownIcon'
import { Cell } from './Cell'

type Props = {
	id: string
	label: string
	width: number
	first?: boolean
	align?: 'right' | 'left' | 'center' | 'justify'
}

export const CellWithFilters: FC<Props> = ({ id, label, width, first, align }) => {
	const tableSort = useAppSelector(getTableSort)

	// const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const setSortHandler = (fieldId: string) => () => {
		console.log(fieldId)

		// dispatch(setSort(fieldId))
	}

	return (
		<Stack
			width={width}
			sx={{
				backgroundColor: '#fff',
				padding: 0,
				minWidth: width,
				maxWidth: width,
				borderBottomColor: palette.primary.main,
				':before': {
					content: !first ? '""' : null,
					width: '1px',
					height: '60%',
					background: '#e0e0e0',
					position: 'absolute',
					top: '20%',
					left: -0.5,
				},
			}}
		>
			<Cell label={label} width={width} first={first} align={align} inCeil onClick={setSortHandler(id)} />

			<Stack direction={'row'} spacing={2} mb={0.5} justifyContent={'center'} alignItems={'center'}>
				<Tooltip title={'Сортировать'} arrow>
					<Button onClick={setSortHandler(id)} sx={{ ml: 1 }}>
						{tableSort?.field !== id || tableSort?.type == 'ASC' ? (
							<SortUpIcon fontSize={16} color={tableSort?.field === id ? 'black' : '#adadad'} />
						) : null}

						{tableSort?.field === id && tableSort?.type == 'DESC' ? (
							<SortDownIcon fontSize={16} color={tableSort?.field === id ? 'black' : '#adadad'} />
						) : null}
					</Button>
				</Tooltip>

				{/* <Filter cell={c} fieldId={c.id} /> */}
			</Stack>
		</Stack>
	)
}
