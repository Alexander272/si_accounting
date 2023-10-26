import { FC, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	Button,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	Menu,
	MenuItem,
	Select,
	Stack,
	SvgIcon,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'

import type { IDataItem, ISIFilter } from '../../types/data'
import type { IHeadCell } from './DataTableHead'

// const defaultValue = {}

type Props = {
	cell: IHeadCell
	fieldId: keyof IDataItem
	// type: 'string' |'number'|'date'
}

export const Filter: FC<Props> = ({ cell }) => {
	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	const { control, watch } = useForm<ISIFilter>({
		defaultValues: { field: cell.id, compareType: !cell.type ? 'contains' : 'equals' },
	})
	console.log(watch('compareType'))

	const toggleHandler = () => setOpen(prev => !prev)

	const clickFilterHandler = () => {
		// event.stopPropagation()
		toggleHandler()
	}

	const renderFilter = () => {
		if (cell.type == 'date') {
			return [
				<Controller
					key={'compareType'}
					control={control}
					name='compareType'
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel id='filter-select'>Операторы</InputLabel>

							<Select {...field} error={Boolean(error)} labelId='filter-select' label='Операторы'>
								<MenuItem value='equals'>Равна</MenuItem>
								<MenuItem value='more'>Больше чем</MenuItem>
								<MenuItem value='less'>Меньше чем</MenuItem>
								<MenuItem value='period'>В диапазоне</MenuItem>
							</Select>
						</FormControl>
					)}
				/>,

				<Controller
					key={'value'}
					control={control}
					name={'valueStart'}
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<DatePicker
							{...field}
							label={'Значение'}
							showDaysOutsideCurrentMonth
							fixedWeekNumber={6}
							slotProps={{
								textField: {
									error: Boolean(error),
									fullWidth: true,
								},
							}}
						/>
					)}
				/>,
			]
		}

		return [
			<FormControl key={'compareType'} fullWidth sx={{ mb: 2 }}>
				<InputLabel id='filter-select'>Операторы</InputLabel>

				<Select labelId='filter-select' label='Операторы'>
					<MenuItem value='contains'>Содержит</MenuItem>
				</Select>
			</FormControl>,

			<TextField key={'value'} fullWidth label='Значение' />,
		]
	}

	return (
		<>
			<Tooltip title='Фильтр' arrow>
				<IconButton ref={anchor} onClick={clickFilterHandler}>
					<SvgIcon sx={{ fontSize: '16px', fill: '#adadad' }}>
						<svg
							x='0px'
							y='0px'
							viewBox='0 0 122.88 107.128'
							enableBackground='new 0 0 122.88 107.128'
							xmlSpace='preserve'
						>
							<path d='M2.788,0h117.297c1.544,0,2.795,1.251,2.795,2.795c0,0.85-0.379,1.611-0.978,2.124l-46.82,46.586v39.979 c0,1.107-0.643,2.063-1.576,2.516l-22.086,12.752c-1.333,0.771-3.039,0.316-3.812-1.016c-0.255-0.441-0.376-0.922-0.375-1.398 h-0.006V51.496L0.811,4.761C-0.275,3.669-0.27,1.904,0.822,0.819c0.544-0.541,1.255-0.811,1.966-0.811V0L2.788,0z M113.323,5.591 H9.493L51.851,48.24c0.592,0.512,0.966,1.27,0.966,2.114v49.149l16.674-9.625V50.354h0.008c0-0.716,0.274-1.432,0.822-1.977 L113.323,5.591L113.323,5.591z' />
						</svg>
					</SvgIcon>
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

				{renderFilter()}

				<Stack direction={'row'} mt={3} spacing={2}>
					<Button fullWidth sx={{ borderRadius: 3 }}>
						Отменить
					</Button>

					<Button fullWidth variant='outlined' sx={{ borderRadius: 3 }}>
						Применить
					</Button>
				</Stack>
			</Menu>
		</>
	)
}
