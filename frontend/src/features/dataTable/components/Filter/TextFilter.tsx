import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'

import { CompareTypes, IDataItem, ISIFilter } from '../../types/data'

type TextFilter = {
	// fieldType: string
	compareType: CompareTypes
	valueStart: string
	// valueEnd: string
}

const defaultValues: TextFilter = {
	// field: 'name',
	// fieldType: 'string',
	compareType: 'con',
	valueStart: '',
	// valueEnd: '',
}

type Props = {
	field: keyof IDataItem
	values?: TextFilter
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const TextFilter: FC<Props> = ({ field, values, onCancel, onSubmit }) => {
	// defaultValues.field = field
	const methods = useForm<TextFilter>({ values: values || defaultValues })

	const submitHandler = methods.handleSubmit(data => {
		const value = [{ compareType: data.compareType, value: data.valueStart }]
		value.push()

		const filter: ISIFilter = {
			field: field,
			fieldType: 'date',
			values: value,
		}

		onSubmit(filter)
	})

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

			<TextField
				{...methods.register('valueStart')}
				error={Boolean(methods.formState.errors.valueStart)}
				label='Значение'
				fullWidth
			/>

			<Stack direction={'row'} mt={3} spacing={2}>
				<Button onClick={onCancel} fullWidth>
					Отменить
				</Button>

				<Button onClick={submitHandler} fullWidth variant='outlined'>
					Применить
				</Button>
			</Stack>
		</>
	)
}
