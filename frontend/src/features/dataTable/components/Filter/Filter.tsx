import { FC, Suspense, useRef, useState } from 'react'
import { Divider, IconButton, Menu, Stack, Tooltip, Typography } from '@mui/material'

import { Filters, type IHeadCell } from '../Table/Head/columns'
import type { ISIFilter } from '../../types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { FilterIcon } from '@/components/Icons/FilterIcon'
import { getTableFilter, setFilters, setPage } from '../../dataTableSlice'
import { DateFilter } from './DateFilter'
import { NumberFilter } from './NumberFilter'
import { TextFilter } from './TextFilter'
import { HeadBadge } from '../Table/Head/HeadBadge'
import { Fallback } from '@/components/Fallback/Fallback'

type Props = {
	cell: IHeadCell
}

export const Filter: FC<Props> = ({ cell }) => {
	const filters = useAppSelector(getTableFilter)
	// const index = filters?.findIndex(f => f.field == cell.id)
	const filter = filters?.find(f => f.field == cell.id)
	const filterCell = Filters.find(f => f.id == cell.id)

	const dispatch = useAppDispatch()

	// const { data: departments } = useGetDepartmentsQuery(null)

	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	const toggleHandler = () => setOpen(prev => !prev)

	const clickFilterHandler = () => {
		// event.stopPropagation()
		toggleHandler()
	}

	const clearHandler = () => {
		if (filter) dispatch(setFilters({ field: cell.id, fieldType: '', values: [] }))
		toggleHandler()
	}
	const submitHandler = (data: ISIFilter) => {
		dispatch(setFilters(data))
		dispatch(setPage(1))
		toggleHandler()
	}

	const values = filter && {
		compareType: filter.values.length > 1 ? 'range' : filter.values[0].compareType,
		valueStart: filter.values[0].value,
		valueEnd: filter.values[1] ? filter.values[1].value : '',
	}

	return (
		<>
			<Tooltip title='Фильтр' arrow>
				<IconButton ref={anchor} onClick={clickFilterHandler}>
					<HeadBadge
						color='primary'
						variant={(filters?.length || 0) > 1 ? 'standard' : 'dot'}
						badgeContent={(filters?.findIndex(f => f.field == cell.id) ?? -1) + 1}
					>
						<FilterIcon fontSize={16} color={filter?.field === cell.id ? 'black' : '#adadad'} />
					</HeadBadge>
				</IconButton>
			</Tooltip>

			<Menu
				open={open}
				onClose={toggleHandler}
				anchorEl={anchor.current}
				transformOrigin={{ horizontal: 'center', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
				MenuListProps={{
					role: 'listbox',
					disableListWrap: true,
				}}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							paddingX: 2,
							paddingBottom: 2,
							maxWidth: 400,
							width: '100%',
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								left: '50%',
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translate(-50%, -50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					},
				}}
			>
				<Stack
					direction={'row'}
					// paddingY={1}
					alignItems={'center'}
					spacing={1}
					minWidth={300}
					width={'100%'}
				>
					<Typography ml={1} mr={1} fontWeight={'bold'} align='center' width={'100%'}>
						{cell.label}
					</Typography>

					<IconButton onClick={toggleHandler} sx={{ lineHeight: '16px' }}>
						&times;
					</IconButton>
				</Stack>

				<Divider sx={{ mb: 2, mt: 1 }} />

				{filterCell?.type == 'date' && (
					<DateFilter field={cell.id} values={values} onCancel={clearHandler} onSubmit={submitHandler} />
				)}
				{/* {cell.type == 'list' && (
					<ListFilter
						field={cell.id}
						values={filter?.values[0].value.split(',')}
						list={departments?.data || []}
						onCancel={clearHandler}
						onSubmit={submitHandler}
					/>
				)} */}
				{filterCell?.type == 'number' && (
					<NumberFilter field={cell.id} values={values} onCancel={clearHandler} onSubmit={submitHandler} />
				)}
				{/* {filterCell?.filterComponent &&
					filterCell.filterComponent({
						field: cell.id,
						values: filter?.values[0].value.split(','),
						onSubmit: submitHandler,
						onCancel: clearHandler,
					})} */}
				<Suspense fallback={<Fallback />}>
					{filterCell?.filterComponent && (
						<filterCell.filterComponent
							field={cell.id}
							values={filter?.values[0].value.split(',')}
							onSubmit={submitHandler}
							onCancel={clearHandler}
						/>
					)}
				</Suspense>

				{(!filterCell?.type && !filterCell?.filterComponent) || filterCell.type == 'string' ? (
					<TextFilter
						field={cell.id}
						values={
							filter && { compareType: filter.values[0].compareType, valueStart: filter.values[0].value }
						}
						onCancel={clearHandler}
						onSubmit={submitHandler}
					/>
				) : null}
			</Menu>
		</>
	)
}
