import { FC } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

import type { CompareTypes, IDataItem, ISIFilter, ISIFilterValue } from '../../types/data'

// type CompareTypes = 'eq' | 'gte' | 'lte' | 'range'
type DateFilter = {
	// fieldType: string
	compareType: CompareTypes
	valueStart: string
	valueEnd: string
}

const defaultValues: DateFilter = {
	// field: 'verificationDate',
	// fieldType: 'date',
	compareType: 'eq',
	valueStart: '',
	valueEnd: '',
}

type Props = {
	field: keyof IDataItem
	values?: DateFilter
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const DateFilter: FC<Props> = ({ field, values, onCancel, onSubmit }) => {
	// defaultValues.field = field
	const methods = useForm<DateFilter>({ values: values || defaultValues })

	const compareType = methods.watch('compareType')

	const submitHandler = methods.handleSubmit(data => {
		const value: ISIFilterValue[] = []
		if (data.compareType == 'range') {
			value.push({ compareType: 'gte', value: data.valueStart }, { compareType: 'lte', value: data.valueEnd })
		} else {
			value.push({ compareType: data.compareType, value: data.valueStart })
		}

		const filter: ISIFilter = {
			field: field,
			fieldType: 'date',
			values: value,
		}

		onSubmit(filter)
	})

	return (
		<FormProvider {...methods}>
			<Controller
				control={methods.control}
				name='compareType'
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<FormControl fullWidth>
						<InputLabel id='filter-select'>Операторы</InputLabel>

						<Select {...field} error={Boolean(error)} labelId='filter-select' label='Операторы'>
							<MenuItem value='eq'>Равна</MenuItem>
							<MenuItem value='gte'>Больше или равна</MenuItem>
							<MenuItem value='lte'>Меньше или равна</MenuItem>
							<MenuItem value='range'>В диапазоне</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			<Controller
				control={methods.control}
				name={'valueStart'}
				rules={{ required: true, min: 1000000000 }}
				render={({ field, fieldState: { error } }) => (
					<DatePicker
						// {...field}
						value={dayjs(field.value != '' ? +field.value * 1000 : null)}
						onChange={value => field.onChange(value?.startOf('d').unix())}
						label={compareType != 'range' ? 'Значение' : 'Начало'}
						showDaysOutsideCurrentMonth
						fixedWeekNumber={6}
						sx={{ mt: 2 }}
						slotProps={{
							textField: {
								error: Boolean(error),
								fullWidth: true,
							},
						}}
					/>
				)}
			/>

			{compareType == 'range' && (
				<Controller
					control={methods.control}
					name={'valueEnd'}
					rules={{ required: true, min: 1000000000 }}
					render={({ field, fieldState: { error } }) => (
						<DatePicker
							// {...field}
							value={dayjs(field.value != '' ? +field.value * 1000 : null)}
							onChange={value => field.onChange(value?.unix())}
							label={'Конец'}
							showDaysOutsideCurrentMonth
							fixedWeekNumber={6}
							sx={{ mt: 2 }}
							slotProps={{
								textField: {
									error: Boolean(error),
									fullWidth: true,
								},
							}}
						/>
					)}
				/>
			)}

			<Stack direction={'row'} mt={3} spacing={2}>
				<Button onClick={onCancel} fullWidth>
					Отменить
				</Button>

				<Button onClick={submitHandler} fullWidth variant='outlined'>
					Применить
				</Button>
			</Stack>
		</FormProvider>
	)
}
