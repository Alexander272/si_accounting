import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { ISIFilter, ISISort, ISelected } from '../../types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
	addSelected,
	getSelectedItems,
	getTableFilter,
	getTableSize,
	getTablePage,
	getTableSort,
	removeSelected,
} from '../../dataTableSlice'
import { CheckListIcon } from '@/components/Icons/CheckListIcon'
import { CheckAllIcon } from '@/components/Icons/CheckAllIcon'
import { DelayIcon } from '@/components/Icons/DelayIcon'
import { CalendarIcon } from '@/components/Icons/CalendarIcon'
import { useGetAllSIQuery, useLazyGetAllSIQuery } from '../../siApiSlice'

export const FastChoose = () => {
	const anchor = useRef<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	const [fetchSi] = useLazyGetAllSIQuery()

	const selected = useAppSelector(getSelectedItems)
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const dispatch = useAppDispatch()

	const { data } = useGetAllSIQuery({ page, size, sort, filter: filter ? [filter] : [] })

	const toggleHandler = () => setOpen(prev => !prev)

	const selectAllHandler = () => {
		if (selected.length) {
			dispatch(removeSelected())
			toggleHandler()
		} else fetching(filter ? [filter] : [], sort)
	}

	const selectOverdueHandler = async () => {
		const newFilter: ISIFilter = {
			field: 'nextVerificationDate',
			fieldType: 'date',
			compareType: 'lte',
			valueStart: dayjs().startOf('d').unix().toString(),
			valueEnd: '',
		}

		fetching(filter ? [filter, newFilter] : [newFilter])
	}

	const selectMonthHandler = async () => {
		const newFilter: ISIFilter = {
			field: 'nextVerificationDate',
			fieldType: 'date',
			compareType: 'range',
			valueStart: dayjs().startOf('month').unix().toString(),
			valueEnd: dayjs().endOf('month').unix().toString(),
		}

		fetching(filter ? [filter, newFilter] : [newFilter])
	}

	const fetching = async (filter?: ISIFilter[], sort?: ISISort) => {
		try {
			const payload = await fetchSi({ size: data?.total, filter, sort }).unwrap()
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
				<MenuItem onClick={selectMonthHandler}>
					<ListItemIcon>
						<CalendarIcon fontSize={18} fill='#474747' />
					</ListItemIcon>
					Все за текущий месяц
				</MenuItem>
			</Menu>
		</>
	)
}
