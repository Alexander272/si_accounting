import { IconButton, Stack, Tooltip, useTheme } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getTableSort, setSort } from '@/features/dataTable/dataTableSlice'
import { IDataItem } from '@/features/dataTable/types/data'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'
import { SortDownIcon } from '@/components/Icons/SortDownIcon'
import { HeadCell } from './HeadCell'
import { HeadCells } from './columns'
import { Filter } from '../../Filter/Filter'
import { HeadBadge } from './HeadBadge'

export const Header = () => {
	const tableSort = useAppSelector(getTableSort)

	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const setSortHandler = (fieldId: keyof IDataItem) => () => {
		dispatch(setSort(fieldId))
	}

	return (
		<Stack direction={'row'}>
			{HeadCells.map((c, i) => (
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
								{/* {tableSort?.field !== c.id || tableSort?.type == 'ASC' ? (
									<SortUpIcon fontSize={16} fill={tableSort?.field === c.id ? 'black' : '#adadad'} />
								) : null}

								{tableSort?.field === c.id && tableSort?.type == 'DESC' ? (
									<SortDownIcon
										fontSize={16}
										fill={tableSort?.field === c.id ? 'black' : '#adadad'}
									/>
								) : null} */}

								{!tableSort[c.id] || tableSort[c.id] == 'ASC' ? (
									<HeadBadge
										color='primary'
										badgeContent={Object.keys(tableSort).findIndex(k => k == c.id) + 1}
										invisible={Object.keys(tableSort).length < 2}
									>
										<SortUpIcon fontSize={16} fill={tableSort[c.id] ? 'black' : '#adadad'} />
									</HeadBadge>
								) : null}

								{tableSort[c.id] == 'DESC' ? (
									<HeadBadge
										color='primary'
										badgeContent={Object.keys(tableSort).findIndex(k => k == c.id) + 1}
									>
										<SortDownIcon fontSize={16} fill={tableSort[c.id] ? 'black' : '#adadad'} />
									</HeadBadge>
								) : null}
							</IconButton>
						</Tooltip>

						<Filter cell={c} />
					</Stack>
				</Stack>
			))}
		</Stack>
	)
}
