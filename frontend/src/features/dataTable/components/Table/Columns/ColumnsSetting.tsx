import { FC, useRef, useState } from 'react'
import {
	Button,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Stack,
	Switch,
	TextField,
	Typography,
	useTheme,
} from '@mui/material'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import type { IColumn } from '@/features/dataTable/types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getColumns, getHidden, setHidden } from '@/features/dataTable/dataTableSlice'
import { Popover } from '@/components/Popover/Popover'
import { SettingIcon } from '@/components/Icons/SettingIcon'
import { CheckIcon } from '@/components/Icons/CheckSimpleIcon'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { LeftArrowIcon } from '@/components/Icons/LeftArrowIcon'
import { WidthIcon } from '@/components/Icons/WidthIcon'
import { HeadCells, initWidth } from '../Head/columns'

export const ColumnsSetting: FC = () => {
	const { palette } = useTheme()

	const [open, setOpen] = useState(false)
	const anchor = useRef(null)

	const hidden = useAppSelector(getHidden)
	const columns = useAppSelector(getColumns)
	const dispatch = useAppDispatch()

	// const methods = useForm<{ [key: string]: boolean }>({
	// 	values: HeadCells.reduce((a, v) => ({ ...a, [v.id]: hidden[v.id] || false }), {}),
	// })
	const { control, handleSubmit } = useForm<{ data: IColumn[] }>({ values: { data: columns } })
	const { fields } = useFieldArray({ control, name: 'data' })

	const toggleHandler = () => setOpen(prev => !prev)
	const closeHandler = () => toggleHandler()

	const resetHandler = () => {
		dispatch(setHidden())
		closeHandler()
	}

	const applyHandler = handleSubmit(form => {
		console.log('apply', form)
	})

	return (
		<>
			<IconButton ref={anchor} onClick={toggleHandler}>
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
						<Button onClick={resetHandler} variant='outlined' color='gray' sx={{ minWidth: 40 }}>
							<TimesIcon fill={palette.gray.main} fontSize={12} />
						</Button>

						<Button onClick={applyHandler} variant='contained' sx={{ minWidth: 40, padding: '6px 12px' }}>
							<CheckIcon fill={palette.common.white} fontSize={20} />
						</Button>
					</Stack>
				</Stack>

				<Stack spacing={1} maxHeight={450} overflow={'auto'} ml={1.5}>
					{/* //TODO можно еще попробовать менять порядок колонок и регулировать ширину колонок */}
					{fields.map((f, i) => (
						<Stack key={f.id} direction={'row'} alignItems={'flex-start'}>
							<Stack height={'fit-content'} mr={1} mt={'5px'}>
								<LeftArrowIcon fontSize={14} transform={'rotate(90deg)'} cursor={'pointer'} />
								<LeftArrowIcon fontSize={14} transform={'rotate(-90deg)'} />
							</Stack>

							<Controller
								control={control}
								name={`data.${i}.hidden`}
								render={({ field }) => (
									<FormControlLabel
										label={f.label}
										sx={{
											color: !field.value ? 'inherit' : '#505050',
											transition: '.2s color ease-in-out',
											userSelect: 'none',
										}}
										control={
											<Switch
												checked={!field.value}
												onChange={event => field.onChange(!event.target.checked)}
											/>
										}
									/>
								)}
							/>
							<Controller
								control={control}
								name={`data.${i}.width`}
								rules={{
									min: 50,
									max: 800,
									pattern: {
										value: /^(0|[1-9]\d*)(\.\d+)?$/,
										message: '',
									},
								}}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										error={Boolean(error)}
										helperText={error ? '50 ≤ Размер ≤ 800' : ''}
										// type='number'
										InputProps={{
											startAdornment: (
												<InputAdornment position='start'>
													<WidthIcon fontSize={18} />
												</InputAdornment>
											),
										}}
										sx={{
											width: 120,
											minWidth: 120,
											ml: 'auto',
											'.MuiFormHelperText-root': { mx: 0.8 },
										}}
									/>
								)}
							/>
						</Stack>
					))}
					{/* {HeadCells.map(c => (
						<Stack direction={'row'} key={c.id}>
							<Controller
								control={methods.control}
								name={c.id}
								render={({ field }) => (
									<FormControlLabel
										label={c.label}
										sx={{
											color: !field.value ? 'inherit' : '#505050',
											transition: '.2s color ease-in-out',
											userSelect: 'none',
										}}
										control={
											<Switch
												checked={!field.value}
												onChange={event => field.onChange(!event.target.checked)}
											/>
										}
									/>
								)}
							/>
						</Stack>
					))} */}
				</Stack>
			</Popover>
		</>
	)
}
