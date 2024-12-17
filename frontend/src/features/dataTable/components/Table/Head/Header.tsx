import { IconButton, Stack, Tooltip, useTheme } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getColumns, getTableSort, setSort } from '@/features/dataTable/dataTableSlice'
import { IDataItem } from '@/features/dataTable/types/data'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'
import { SortDownIcon } from '@/components/Icons/SortDownIcon'
import { Filter } from '../../Filter/Filter'
import { HeadCell } from './HeadCell'
import { HeadBadge } from './HeadBadge'

export const Header = () => {
	const tableSort = useAppSelector(getTableSort)
	const columns = useAppSelector(getColumns)

	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const setSortHandler = (fieldId: keyof IDataItem) => () => {
		dispatch(setSort(fieldId))
	}

	// const width = HeadCells.reduce((ac, cur) => ac + (hidden[cur.key] ? 0 : cur.width || ColWidth), 12)

	return (
		<Stack direction={'row'}>
			{columns.map((c, i) => {
				if (c.hidden) return null
				return (
					<Stack
						key={c.id}
						width={c.width}
						alignItems={'center'}
						sx={{
							backgroundColor: '#fff',
							padding: 0,
							minWidth: c.width,
							maxWidth: c.width,
							position: 'relative',
							borderBottom: `1px solid ${palette.primary.main}`,
							':before': {
								content: i ? '""' : null,
								width: '1px',
								height: '60%',
								background: '#e0e0e0',
								position: 'absolute',
								top: '20%',
								left: -0.5,
							},
						}}
					>
						<HeadCell label={c.label} onClick={setSortHandler(c.id)} />

						<Stack direction={'row'} spacing={2} mb={0.5} justifyContent={'center'} alignItems={'center'}>
							<Tooltip title={'Сортировать'} arrow>
								<IconButton onClick={setSortHandler(c.id)} sx={{ ml: 1 }}>
									<HeadBadge
										color='primary'
										badgeContent={Object.keys(tableSort).findIndex(k => k == c.id) + 1}
										invisible={Object.keys(tableSort).length < 2}
									>
										{!tableSort[c.id] || tableSort[c.id] == 'ASC' ? (
											<SortUpIcon fontSize={16} fill={tableSort[c.id] ? 'black' : '#adadad'} />
										) : null}
										{tableSort[c.id] == 'DESC' ? (
											<SortDownIcon fontSize={16} fill={tableSort[c.id] ? 'black' : '#adadad'} />
										) : null}
									</HeadBadge>
								</IconButton>
							</Tooltip>

							<Filter cell={c} />
						</Stack>
					</Stack>
				)
			})}
		</Stack>
	)
}
