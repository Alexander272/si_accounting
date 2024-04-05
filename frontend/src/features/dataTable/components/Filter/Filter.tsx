import { FC, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Divider, IconButton, Menu, Stack, Tooltip, Typography } from '@mui/material'

import type { IDataItem, ISIFilter } from '../../types/data'
import type { IHeadCell } from '../DataTableHead/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetDepartmentsQuery } from '@/features/employees/employeesApiSlice'
import { FilterIcon } from '@/components/Icons/FilterIcon'
import { getTableFilter, setFilters } from '../../dataTableSlice'
import { DateFilter } from './DateFilter'
import { TextFilter } from './TextFilter'
import { NumberFilter } from './NumberFilter'
import { ListFilter } from './ListFilter'

type Props = {
	cell: IHeadCell
	fieldId: keyof IDataItem
}

// const Reserve = {
// 	id: 'null',
// 	name: 'Резерв',
// 	leaderId: '',
// }

export const Filter: FC<Props> = ({ cell }) => {
	const filter = useAppSelector(getTableFilter)

	const dispatch = useAppDispatch()

	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	const methods = useForm<ISIFilter>({
		defaultValues: {
			field: cell.id,
			fieldType: cell.type || 'string',
			compareType: filter?.compareType || !cell.type ? 'con' : 'eq',
			valueStart: filter?.valueStart || '',
			valueEnd: filter?.valueEnd || '',
		},
	})

	const { data: departments } = useGetDepartmentsQuery(null)

	const options = {
		// place: [Reserve, ...(departments?.data || [])],
		place: departments?.data || [],
	}

	const toggleHandler = () => setOpen(prev => !prev)

	const clickFilterHandler = () => {
		// event.stopPropagation()
		toggleHandler()
	}

	const clearHandler = () => {
		if (filter) dispatch(setFilters())
		toggleHandler()
	}

	const submitHandler = methods.handleSubmit(data => {
		dispatch(setFilters(data.valueStart != '' ? data : undefined))
		toggleHandler()
	})

	//TODO надо переделать фильтры и сделать возможность создания множественной фильтрации
	return (
		<>
			<Tooltip title='Фильтр' arrow>
				<IconButton ref={anchor} onClick={clickFilterHandler}>
					<FilterIcon fontSize={16} color={filter?.field === cell.id ? 'black' : '#adadad'} />
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

				<FormProvider {...methods}>
					{cell.type == 'date' && <DateFilter />}

					{cell.type == 'number' && <NumberFilter />}

					{!cell.type || cell.type == 'string' ? <TextFilter /> : null}

					{cell.type == 'list' && <ListFilter list={options[cell.id as 'place']} />}
				</FormProvider>

				<Stack direction={'row'} mt={3} spacing={2}>
					<Button onClick={clearHandler} fullWidth>
						Отменить
					</Button>

					<Button onClick={submitHandler} fullWidth variant='outlined'>
						Применить
					</Button>
				</Stack>
			</Menu>
		</>
	)
}
