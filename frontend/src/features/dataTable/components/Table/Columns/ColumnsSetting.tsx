import { useRef, useState } from 'react'
import { Button, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { ReactSortable } from 'react-sortablejs'
import { SortableEvent } from 'sortablejs'
import './style.css'

import type { IColumn } from '@/features/dataTable/types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getColumns, setColumns } from '@/features/dataTable/dataTableSlice'
import { Popover } from '@/components/Popover/Popover'
import { SettingIcon } from '@/components/Icons/SettingIcon'
import { CheckIcon } from '@/components/Icons/CheckSimpleIcon'
import { RefreshIcon } from '@/components/Icons/RefreshIcon'
import { Column } from './Column'
import { HeadCells, initWidth } from '../Head/columns'

export default function ColumnsSetting() {
	const { palette } = useTheme()

	const [open, setOpen] = useState(false)
	const anchor = useRef(null)

	const columns = useAppSelector(getColumns)
	const dispatch = useAppDispatch()

	// const methods = useForm<{ [key: string]: boolean }>({
	// 	values: HeadCells.reduce((a, v) => ({ ...a, [v.id]: hidden[v.id] || false }), {}),
	// })
	const methods = useForm<{ data: IColumn[] }>({ values: { data: columns } })
	const { control, handleSubmit } = methods
	const { fields, move } = useFieldArray({ control, name: 'data' })

	const toggleHandler = () => setOpen(prev => !prev)
	const closeHandler = () => toggleHandler()

	const resetHandler = () => {
		dispatch(setColumns(HeadCells.map(c => ({ id: c.id, label: c.label, width: c.width }))))
		closeHandler()
	}

	const applyHandler = handleSubmit(form => {
		console.log('apply', form)
		dispatch(setColumns(form.data.map(c => ({ ...c, width: +(c.width ? c.width : initWidth) }))))
		closeHandler()
	})

	// const moveHandler = (from: number, to: number) => {
	// 	move(from, to)
	// }
	// const dragHandler = (newState: FieldArrayWithId<{ data: IColumn[] }, 'data', 'id'>[]) => {
	// 	console.log('newState', newState)
	// 	// replace(newState)
	// 	// console.log('sortable', sortable)
	// 	// console.log('store', store)
	// }
	const dropHandler = (evt: SortableEvent) => {
		// console.log('evt', evt)
		if (evt.oldIndex != undefined && evt.newIndex != undefined) move(evt.oldIndex, evt.newIndex)
	}

	return (
		<>
			<IconButton ref={anchor} onClick={toggleHandler} sx={{ my: '-3px!important' }}>
				<SettingIcon fontSize={20} />
			</IconButton>

			<Popover
				open={open}
				onClose={closeHandler}
				anchorEl={anchor.current}
				paperSx={{ padding: 0, maxWidth: 500 }}
			>
				<Stack direction={'row'} mx={2} mt={1} mb={2.5} justifyContent={'space-between'} alignItems={'center'}>
					<Typography fontSize={'1.1rem'}>Настройка колонок</Typography>

					<Stack direction={'row'} spacing={1} height={34}>
						<Tooltip title='Сбросить настройки'>
							<Button onClick={resetHandler} variant='outlined' color='inherit' sx={{ minWidth: 40 }}>
								<RefreshIcon fontSize={18} />
							</Button>
						</Tooltip>

						<Button onClick={applyHandler} variant='contained' sx={{ minWidth: 40, padding: '6px 15px' }}>
							<CheckIcon fill={palette.common.white} fontSize={20} />
						</Button>
					</Stack>
				</Stack>

				<Stack maxHeight={450} overflow={'auto'} ml={0.5}>
					<FormProvider {...methods}>
						<ReactSortable list={fields} setList={() => {}} onEnd={dropHandler} handle='.drag'>
							{fields.map((f, i) => (
								<Column key={f.id} index={i} label={f.label} />
							))}
						</ReactSortable>
					</FormProvider>
				</Stack>
			</Popover>
		</>
	)
}
