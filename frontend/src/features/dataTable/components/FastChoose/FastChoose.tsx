import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import dayjs from 'dayjs'

import { CheckListIcon } from '@/components/Icons/CheckListIcon'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import type { ISIFilter, ISISort } from '../../types/data'
import {
	addSelected,
	getSelectedItems,
	getTableFilter,
	getTableLimit,
	getTablePage,
	getTableSort,
	removeSelected,
} from '../../dataTableSlice'
import { useGetAllSIQuery, useLazyGetAllSIQuery } from '../../siApiSlice'
import { toast } from 'react-toastify'
import { IFetchError } from '@/app/types/error'

export const FastChoose = () => {
	const anchor = useRef<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	const [fetchSi] = useLazyGetAllSIQuery()

	const selected = useAppSelector(getSelectedItems)
	const page = useAppSelector(getTablePage)
	const limit = useAppSelector(getTableLimit)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const dispatch = useAppDispatch()

	const { data } = useGetAllSIQuery({ page, limit, sort, filter })

	const toggleHandler = () => setOpen(prev => !prev)

	const selectAllHandler = () => {
		if (selected.length) {
			dispatch(removeSelected())
			toggleHandler()
		} else fetching(filter, sort)
	}

	const selectOverdueHandler = async () => {
		const filter: ISIFilter = {
			field: 'nextVerificationDate',
			compareType: 'less',
			valueStart: dayjs().unix().toString(),
			valueEnd: '',
		}

		fetching(filter)
	}

	const selectMonthHandler = async () => {
		const filter: ISIFilter = {
			field: 'nextVerificationDate',
			compareType: 'period',
			valueStart: dayjs().startOf('month').unix().toString(),
			valueEnd: dayjs().endOf('month').unix().toString(),
		}

		fetching(filter)
	}

	const fetching = async (filter?: ISIFilter, sort?: ISISort) => {
		try {
			const payload = await fetchSi({ limit: data?.total, filter, sort })
			const identifiers = payload.data?.data.map(si => si.id) || []
			dispatch(addSelected(identifiers))
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			toggleHandler()
		}
	}

	//TODO можно сделать выбор всех позиций, просроченных или всех за определенный месяц и кнопочку для отмены выбора
	return (
		<>
			<Button
				ref={anchor}
				onClick={toggleHandler}
				size='small'
				variant='outlined'
				color='inherit'
				sx={{ borderRadius: 3, paddingX: 1.5 }}
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
				{/* //TODO решить как выбирать элементы и что делать если не все элементы которые должны быть выбраны влазят на одну страницу */}
				<MenuItem onClick={selectAllHandler}>
					<ListItemIcon>IC</ListItemIcon>
					{selected.length ? 'Отменить выбор' : 'Выбрать все'}
				</MenuItem>
				<MenuItem onClick={selectOverdueHandler}>
					<ListItemIcon>IC</ListItemIcon>
					Все просроченные
				</MenuItem>
				<MenuItem onClick={selectMonthHandler}>
					<ListItemIcon>IC</ListItemIcon>
					Все за текущий месяц
				</MenuItem>
			</Menu>
		</>
	)
}
