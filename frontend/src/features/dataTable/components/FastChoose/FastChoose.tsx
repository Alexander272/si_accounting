import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { ISIFilter, ISISortObj, ISelected } from '../../types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { CheckListIcon } from '@/components/Icons/CheckListIcon'
import { CheckAllIcon } from '@/components/Icons/CheckAllIcon'
import { DelayIcon } from '@/components/Icons/DelayIcon'
import { CalendarIcon } from '@/components/Icons/CalendarIcon'
import {
	addSelected,
	getSIStatus,
	getSelectedItems,
	getTableFilter,
	getTableSort,
	removeSelected,
} from '../../dataTableSlice'
import { useLazyGetAllSIQuery } from '../../siApiSlice'
import { useGetAllSI } from '../../hooks/getAllSI'

export const FastChoose = () => {
	const anchor = useRef<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	const [fetchSi] = useLazyGetAllSIQuery()

	const selected = useAppSelector(getSelectedItems)

	const status = useAppSelector(getSIStatus)
	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const dispatch = useAppDispatch()

	const { data } = useGetAllSI()

	const toggleHandler = () => setOpen(prev => !prev)

	const selectAllHandler = () => {
		if (selected.length) {
			dispatch(removeSelected())
			toggleHandler()
		} else fetching(filter, sort)
	}

	const selectOverdueHandler = async () => {
		const newFilter: ISIFilter = {
			field: 'nextVerificationDate',
			fieldType: 'date',
			values: [{ compareType: 'lte', value: dayjs().startOf('d').unix().toString() }],
			// compareType: 'lte',
			// valueStart: dayjs().startOf('d').unix().toString(),
			// valueEnd: '',
		}

		fetching(filter ? [...filter, newFilter] : [newFilter])
	}

	const selectMonthHandler = (countMonth: number) => async () => {
		const newFilter: ISIFilter = {
			field: 'nextVerificationDate',
			fieldType: 'date',
			values: [
				{ compareType: 'gte', value: dayjs().add(countMonth, 'M').startOf('month').unix().toString() },
				{ compareType: 'lte', value: dayjs().add(countMonth, 'M').endOf('month').unix().toString() },
			],
			// compareType: 'range',
			// valueStart: dayjs().add(countMonth, 'M').startOf('month').unix().toString(),
			// valueEnd: dayjs().add(countMonth, 'M').endOf('month').unix().toString(),
		}

		fetching(filter ? [...filter, newFilter] : [newFilter])
	}

	const fetching = async (filter?: ISIFilter[], sort?: ISISortObj) => {
		try {
			const payload = await fetchSi({ status, size: data?.total, filter, sort }).unwrap()
			const identifiers =
				payload?.data.map(si => {
					const status = si.place == 'Перемещение' ? 'moved' : si.place == 'Резерв' ? 'reserve' : 'used'
					return { id: si.id, status: status } as ISelected
				}) || []
			dispatch(removeSelected())
			dispatch(addSelected(identifiers))
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			toggleHandler()
		}
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
				<CheckListIcon fontSize={16} mr={1} />
				Выбрать
			</Button>

			<Menu
				open={open}
				onClose={toggleHandler}
				anchorEl={anchor.current}
				transformOrigin={{ horizontal: 'center', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
				MenuListProps={{ role: 'listbox', disableListWrap: false }}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							maxWidth: 300,
							width: '100%',
							':before': {
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
				<MenuItem onClick={selectAllHandler} sx={{ fontWeight: selected.length ? 'bold' : 'normal' }}>
					<ListItemIcon>
						<CheckAllIcon fontSize={18} fill={'#474747'} />
					</ListItemIcon>
					{selected.length ? 'Отменить выбор' : 'Выбрать все'}
				</MenuItem>
				<MenuItem onClick={selectOverdueHandler}>
					<ListItemIcon>
						<DelayIcon fontSize={20} fill={'#474747'} />
					</ListItemIcon>
					Все просроченные
				</MenuItem>
				<MenuItem onClick={selectMonthHandler(0)}>
					<ListItemIcon>
						<CalendarIcon fontSize={18} fill='#474747' />
					</ListItemIcon>
					Все за текущий месяц
				</MenuItem>
				<MenuItem onClick={selectMonthHandler(1)}>
					<ListItemIcon>
						<CalendarIcon fontSize={18} fill='#474747' />
					</ListItemIcon>
					Все за следующий месяц
				</MenuItem>
			</Menu>
		</>
	)
}
