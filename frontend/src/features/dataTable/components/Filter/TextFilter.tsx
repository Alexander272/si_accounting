import { Controller, useFormContext } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'

import { ISIFilter } from '../../types/data'

export const TextFilter = () => {
	const methods = useFormContext<ISIFilter>()

	return (
		<>
			<Controller
				name='compareType'
				control={methods.control}
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel id='filter-select'>Операторы</InputLabel>

						<Select {...field} error={Boolean(error)} labelId='filter-select' label='Операторы'>
							<MenuItem value='con'>Содержит</MenuItem>
							<MenuItem value='like'>Равен</MenuItem>
							<MenuItem value='start'>Начинается с</MenuItem>
							<MenuItem value='end'>Заканчивается на</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			<Controller
				name='valueStart'
				control={methods.control}
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<TextField {...field} error={Boolean(error)} label='Значение' fullWidth />
				)}
			/>
		</>
	)
}
