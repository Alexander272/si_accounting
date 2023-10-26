import { Controller, useFormContext } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

import { ISIFilter } from '../../types/data'

export const DateFilter = () => {
	const methods = useFormContext<ISIFilter>()

	const compareType = methods.watch('compareType')

	return (
		<>
			<Controller
				control={methods.control}
				name='compareType'
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<FormControl fullWidth>
						<InputLabel id='filter-select'>Операторы</InputLabel>

						<Select {...field} error={Boolean(error)} labelId='filter-select' label='Операторы'>
							<MenuItem value='equals'>Равна</MenuItem>
							<MenuItem value='more'>Больше чем</MenuItem>
							<MenuItem value='less'>Меньше чем</MenuItem>
							<MenuItem value='period'>В диапазоне</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			<Controller
				control={methods.control}
				name={'valueStart'}
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<DatePicker
						// {...field}
						value={dayjs(field.value != '' ? +field.value * 1000 : null)}
						onChange={value => field.onChange(value?.unix())}
						label={compareType != 'period' ? 'Значение' : 'Начало'}
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

			{compareType == 'period' && (
				<Controller
					control={methods.control}
					name={'valueEnd'}
					rules={{ required: true }}
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
		</>
	)
}
