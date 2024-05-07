import { MouseEvent, useEffect, useRef, useState } from 'react'
import {
	Badge,
	Button,
	ButtonGroup,
	Divider,
	IconButton,
	Menu,
	MenuItem,
	Select,
	type SelectChangeEvent,
	Stack,
	Typography,
} from '@mui/material'
import dayjs from 'dayjs'

import { FilterIcon } from '@/components/Icons/FilterIcon'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getTableFilter, setFilters } from '../../dataTableSlice'
import type { ISIFilter } from '../../types/data'

const months = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

export const FastFilter = () => {
	const filter = useAppSelector(getTableFilter)

	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const [active, setActive] = useState<'overdue' | 'month'>()
	const [month, setMonth] = useState(dayjs().get('month'))

	const dispatch = useAppDispatch()

	useEffect(() => {
		// TODO эта строчка сбрасывает фильтры по умолчанию
		// if (!active) dispatch(setFilters())
		// else {
		// 	const filter: ISIFilter = {
		// 		field: 'nextVerificationDate',
		// 		fieldType: 'date',
		// 		compareType: 'lte',
		// 		valueStart: dayjs().unix().toString(),
		// 		valueEnd: '',
		// 	}
		// 	if (active == 'month') {
		// 		const date = dayjs().set('month', month)
		// 		filter.compareType = 'range'
		// 		filter.valueStart = date.startOf('month').unix().toString()
		// 		filter.valueEnd = date.endOf('month').unix().toString()
		// 	}
		// 	dispatch(setFilters(filter))
		// }
		if (active) {
			const filter: ISIFilter = {
				field: 'nextVerificationDate',
				fieldType: 'date',
				values: [
					{
						compareType: 'lte',
						value: dayjs().startOf('d').unix().toString(),
					},
				],
			}
			if (active == 'month') {
				const date = dayjs().set('month', month)
				filter.values = [
					{ compareType: 'gte', value: date.startOf('month').unix().toString() },
					{ compareType: 'lte', value: date.endOf('month').unix().toString() },
				]
				// filter.compareType = 'range'
				// filter.valueStart = date.startOf('month').unix().toString()
				// filter.valueEnd = date.endOf('month').unix().toString()
			}
			dispatch(setFilters(filter))
		}
	}, [active, month, dispatch])

	const toggleHandler = () => setOpen(prev => !prev)

	const activeHandler = (event: MouseEvent<HTMLButtonElement>) => {
		const name = (event.target as HTMLButtonElement).name as 'overdue' | 'month'

		// if (active == name) setActive(undefined)
		// else setActive(name)
		if (active != name) setActive(name)
	}

	const clearHandler = () => {
		setActive(undefined)
		dispatch(setFilters())
		// toggleHandler()
	}

	const monthHandler = (event: SelectChangeEvent<number>) => {
		setMonth(+event.target.value)
	}

	return (
		<>
			<Button
				ref={anchor}
				onClick={toggleHandler}
				size='small'
				variant='outlined'
				color='inherit'
				sx={{ paddingX: 1.5 }}
			>
				<Badge
					color='secondary'
					variant='dot'
					invisible={!filter?.length}
					anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
					sx={{ mr: 1 }}
				>
					<FilterIcon fontSize={16} /*color={filter ? 'black' : '#adadad'}*/ />
				</Badge>
				Фильтр
			</Button>

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
						Фильтры
					</Typography>

					<IconButton onClick={toggleHandler} sx={{ lineHeight: '16px' }}>
						&times;
					</IconButton>
				</Stack>

				<Divider sx={{ mb: 2, mt: 1 }} />

				<ButtonGroup fullWidth>
					<Button
						name='overdue'
						onClick={activeHandler}
						variant={active == 'overdue' ? 'contained' : 'outlined'}
					>
						Просроченные
					</Button>
					<Button name='month' onClick={activeHandler} variant={active == 'month' ? 'contained' : 'outlined'}>
						По месяцам
					</Button>
				</ButtonGroup>

				{active == 'month' && (
					<Select value={month} onChange={monthHandler} fullWidth sx={{ mt: 2 }}>
						{months.map((m, i) => (
							<MenuItem key={m} value={i}>
								{m}
							</MenuItem>
						))}
					</Select>
				)}

				{filter && (
					<Button onClick={clearHandler} variant='outlined' fullWidth sx={{ mt: 2 }}>
						Сбросить фильтры
					</Button>
				)}
			</Menu>
		</>
	)
}
