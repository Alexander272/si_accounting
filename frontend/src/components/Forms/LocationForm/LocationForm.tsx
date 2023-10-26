import { FC, PropsWithChildren } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Autocomplete, Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

import { LocationFields, type LocationFormType } from '../fields'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { useCreateLocationMutation } from './locationApiSlice'

const defaultValues: LocationFormType = {
	department: '',
	person: '',
	receiptDate: dayjs(),
}

type Props = {
	onSubmit: () => void
}

export const LocationForm: FC<PropsWithChildren<Props>> = ({ children, onSubmit }) => {
	const methods = useForm<LocationFormType>({ defaultValues })

	const { data: instrument } = useGetInstrumentByIdQuery('draft')

	// const { data } = useGetLastLocationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	const departments = [{ id: '1', name: 'test', leader: 'lead' }]
	const users = [{ id: '1', name: 'user', departmentId: '1' }]

	const [create] = useCreateLocationMutation()

	// useEffect(() => {
	// 	if (data) {
	// 		methods.reset({ ...data.data, receiptDate: dayjs(data.data.receiptDate, 'DD.MM.YYYY') })
	// 	}
	// }, [data, methods])

	const options = {
		department: departments,
		person: users,
	}

	const submitHandler = methods.handleSubmit(async data => {
		const location = {
			id: '',
			instrumentId: instrument?.data.id || '',
			department: data.department,
			person: data.person,
			receiptDate: data.receiptDate.format('DD.MM.YYYY'),
			deliveryDate: '',
			status: '',
		}

		try {
			if (!data.id) {
				console.log('submit', data)
				await create(location).unwrap()
			}
			onSubmit()
		} catch (error) {
			console.log(error)
		}
	})

	const renderFields = () => {
		return LocationFields.map(f => {
			switch (f.type) {
				case 'date':
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<DatePicker
									{...field}
									label={f.label}
									showDaysOutsideCurrentMonth
									fixedWeekNumber={6}
									disableFuture
									slotProps={{
										textField: {
											error: Boolean(error),
										},
									}}
								/>
							)}
						/>
					)
				case 'list':
					return (
						//TODO проблема со значениями (value должно быть равно id => надо искать в списке нужный обЪект и onChange нужно менять)
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									value={departments.find(d => d.name == field.value) || ''}
									onChange={(_event, value) => {
										field.onChange(typeof value == 'string' ? value : value.name)
									}}
									options={options[f.key as 'department']}
									getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
									freeSolo
									disableClearable
									noOptionsText='Ничего не найдено'
									renderInput={params => (
										<TextField
											{...params}
											label={f.label}
											autoComplete='off'
											error={Boolean(error)}
										/>
									)}
								/>
							)}
						/>
					)
					break
				default:
					break
			}
		})
	}

	return (
		<Stack component={'form'} onSubmit={submitHandler} paddingX={2} mt={4}>
			<FormProvider {...methods}>
				<Stack spacing={2}>{renderFields()}</Stack>
				<Stack direction={'row'} spacing={3} mt={4}>
					{children}
				</Stack>
			</FormProvider>
		</Stack>
	)
}
