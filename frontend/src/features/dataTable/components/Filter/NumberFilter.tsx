import { FC } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'

import type { CompareTypes, IDataItem, ISIFilter, ISIFilterValue } from '../../types/data'

// type CompareTypes = 'eq' | 'gte' | 'lte' | 'range'
type NumberFilter = {
	// fieldType: string
	compareType: CompareTypes
	valueStart: string
	valueEnd: string
}

const defaultValues: NumberFilter = {
	// field: 'yearOfIssue',
	// fieldType: 'number',
	compareType: 'eq',
	valueStart: '',
	valueEnd: '',
}

type Props = {
	field: keyof IDataItem
	values?: NumberFilter
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const NumberFilter: FC<Props> = ({ field, values, onCancel, onSubmit }) => {
	// defaultValues.field = field
	const methods = useForm<NumberFilter>({ values: values || defaultValues })

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
							<MenuItem value='eq'>Равно</MenuItem>
							<MenuItem value='gte'>Больше или равно</MenuItem>
							<MenuItem value='lte'>Меньше или равно</MenuItem>
							<MenuItem value='range'>В диапазоне</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			<TextField
				{...methods.register('valueStart')}
				error={Boolean(methods.formState.errors.valueStart)}
				label={compareType != 'range' ? 'Значение' : 'Начало'}
				type='number'
				fullWidth
				sx={{ mt: 2 }}
			/>
			{compareType == 'range' && (
				<TextField
					{...methods.register('valueEnd')}
					error={Boolean(methods.formState.errors.valueEnd)}
					label={'Конец'}
					type='number'
					fullWidth
					sx={{ mt: 2 }}
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
