import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Autocomplete, Box, Checkbox, FormControlLabel, LinearProgress, Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import { useGetDepartmentsQuery, useGetEmployeesQuery } from '@/features/employees/employeesApiSlice'
import { LocationFields, type LocationFormType } from '../fields'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { useCreateLocationMutation } from './locationApiSlice'

const defaultValues: LocationFormType = {
	department: '',
	person: '',
	dateOfIssue: dayjs(),
}

type Props = {
	onSubmit: () => void
	instrumentId?: string
	isNew?: boolean
}

export const LocationForm: FC<PropsWithChildren<Props>> = ({ children, onSubmit, instrumentId = 'draft', isNew }) => {
	const methods = useForm<LocationFormType>({ defaultValues })
	const [inReserve, setInReserve] = useState(false)

	const department = methods.watch('department')

	const { data: instrument } = useGetInstrumentByIdQuery(instrumentId)

	// const { data } = useGetLastLocationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	const {
		data: departments,
		isLoading: loadDepartments,
		isFetching: isFetchingDepartments,
	} = useGetDepartmentsQuery(null)

	const departmentId = departments?.data.find(v => v.name == department)?.id

	const {
		data: employees,
		isLoading: loadEmployees,
		isFetching: isFetchingEmployees,
	} = useGetEmployeesQuery(departmentId || departments?.data[0].id || null)

	const [create] = useCreateLocationMutation()

	useEffect(() => {
		if (departments?.data.length) methods.setValue('department', departments.data[0].name)
	}, [departments, methods])
	useEffect(() => {
		if (employees?.data.length) methods.setValue('person', employees.data[0].name)
	}, [employees, methods])

	//TODO надо определять это создание нового инструмента или нет
	//TODO сделать возможность поставить инструмент в резерв (для новых инструментов)

	const options = {
		department: departments?.data || [],
		person: employees?.data || [],
	}
	const loadings = {
		department: isFetchingDepartments,
		person: isFetchingEmployees,
	}

	const reserveHandler = () => setInReserve(prev => !prev)

	const submitHandler = methods.handleSubmit(async data => {
		console.log('location data', data)
		const location = {
			id: '',
			instrumentId: instrument?.data.id || '',
			department: data.department,
			person: data.person,
			dateOfIssue: data.dateOfIssue.format('DD.MM.YYYY'),
			dateOfReceiving: '',
			status: isNew ? (inReserve ? 'reserve' : 'used') : 'moved',
		}

		try {
			if (!data.id) {
				console.log('submit', data)
				await create(location).unwrap()
			}
			onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	})

	const renderFields = () => {
		return LocationFields.map(f => {
			const op = options[f.key as 'department']

			switch (f.type) {
				case 'date':
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							// disabled={inReserve}
							render={({ field, fieldState: { error } }) => (
								// TODO It's recommended to avoid using custom objects containing prototype methods, such as Moment or Luxon, as defaultValues. =>
								// надо подумать может стоит это все изменить (передавать строку и парсить ее, а потом возвращать строку)
								<DatePicker
									{...field}
									label={f.label}
									showDaysOutsideCurrentMonth
									fixedWeekNumber={6}
									disableFuture
									// disabled={inReserve}
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
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							disabled={inReserve}
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									value={op.find(d => d.name == field.value) || op[0]}
									onChange={(_event, value) => {
										field.onChange(typeof value == 'string' ? value : value.name)
									}}
									options={op}
									loading={loadings[f.key as 'department']}
									getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
									freeSolo
									disableClearable
									noOptionsText='Ничего не найдено'
									disabled={inReserve}
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
				default:
					break
			}
		})
	}

	return (
		<Stack component={'form'} onSubmit={submitHandler} paddingX={2} mt={2}>
			{isFetchingDepartments || isFetchingEmployees ? (
				<Box height={0}>
					<LinearProgress />
				</Box>
			) : null}

			<FormProvider {...methods}>
				{!loadDepartments && !loadEmployees ? (
					<Stack spacing={2} mt={3}>
						{isNew && (
							<FormControlLabel
								control={<Checkbox checked={inReserve} />}
								label='В резерве'
								onChange={reserveHandler}
							/>
						)}
						{/* {isNew && <Typography>Новый</Typography>} */}
						{renderFields()}
					</Stack>
				) : null}

				<Stack direction={'row'} spacing={3} mt={4}>
					{children}
				</Stack>
			</FormProvider>
		</Stack>
	)
}
