import { Controller, useFormContext } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'

import { ISIFilter } from '../../types/data'

export const NumberFilter = () => {
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
							<MenuItem value='eq'>Равно</MenuItem>
							<MenuItem value='gte'>Больше чем</MenuItem>
							<MenuItem value='lte'>Меньше чем</MenuItem>
							<MenuItem value='range'>В диапазоне</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			<Controller
				name='valueStart'
				control={methods.control}
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<TextField
						{...field}
						error={Boolean(error)}
						label={compareType != 'range' ? 'Значение' : 'Начало'}
						type='number'
						fullWidth
						sx={{ mt: 2 }}
					/>
				)}
			/>
			{compareType == 'range' && (
				<Controller
					control={methods.control}
					name={'valueEnd'}
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							error={Boolean(error)}
							label={'Конец'}
							type='number'
							fullWidth
							sx={{ mt: 2 }}
						/>
					)}
				/>
			)}
		</>
	)
}
