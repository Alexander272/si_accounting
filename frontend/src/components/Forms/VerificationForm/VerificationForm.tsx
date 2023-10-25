import { FC, PropsWithChildren, useEffect } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import dayjs, { Dayjs } from 'dayjs'

import { VerificationFields, type VerificationFormType } from '../fields'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import {
	useCreateVerificationMutation,
	useGetLastVerificationQuery,
	useUpdateVerificationMutation,
} from './verificationApiSlice'

const defaultValues: VerificationFormType = {
	verificationDate: dayjs(),
	nextVerificationDate: dayjs(),
	verificationFile: '',
	verificationLink: '',
	verificationStatus: 'work',
}

type Props = {
	onSubmit: () => void
}

export const VerificationForm: FC<PropsWithChildren<Props>> = ({ children, onSubmit }) => {
	const methods = useForm<VerificationFormType>({ defaultValues })

	const { data: instrument } = useGetInstrumentByIdQuery('draft')

	const { data } = useGetLastVerificationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	const [create] = useCreateVerificationMutation()
	const [update] = useUpdateVerificationMutation()

	useEffect(() => {
		if (data)
			methods.reset({
				id: data.data.id,
				verificationDate: dayjs(data.data.date, 'DD.MM.YYYY'),
				nextVerificationDate: dayjs(data.data.nextDate, 'DD.MM.YYYY'),
				verificationFile: data.data.fileLink,
				verificationLink: data.data.registerLink,
				verificationStatus: data.data.status,
			})
		else if (instrument) {
			methods.setValue(
				'nextVerificationDate',
				dayjs().add(+instrument.data.interVerificationInterval, 'M').subtract(1, 'd')
			)
		}
	}, [data, methods, instrument])

	const submitHandler = methods.handleSubmit(async data => {
		const verification = {
			id: data.id,
			instrumentId: instrument?.data.id || '',
			date: data.verificationDate.format('DD.MM.YYYY'),
			nextDate: data.nextVerificationDate.format('DD.MM.YYYY'),
			fileLink: data.verificationFile,
			registerLink: data.verificationLink,
			status: data.verificationStatus,
		}

		try {
			if (!data.id) {
				console.log('submit', data)
				await create(verification).unwrap()
			} else if (Object.keys(methods.formState.dirtyFields).length) {
				console.log('dirty values')
				await update(verification).unwrap()
			}
			onSubmit()
		} catch (error) {
			console.log(error)
		}
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const changeVerificationDataHandler = (onChange: (...event: any[]) => void) => (value: string | Dayjs | null) => {
		onChange(value)
		if (!value || typeof value === 'string') return

		methods.setValue(
			'nextVerificationDate',
			value.add(+(instrument?.data.interVerificationInterval || 0), 'M').subtract(1, 'd')
		)
	}

	const renderFields = () => {
		return VerificationFields.map(f => {
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
									onChange={
										f.key == 'verificationDate'
											? changeVerificationDataHandler(field.onChange)
											: field.onChange
									}
									label={f.label}
									showDaysOutsideCurrentMonth
									fixedWeekNumber={6}
									slotProps={{
										textField: {
											error: Boolean(error),
											// helperText: error?.message ?? ' ',
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
							render={({ field, fieldState: { error } }) => (
								<FormControl>
									<InputLabel id={f.key}>{f.label}</InputLabel>

									<Select labelId={f.key} label={f.label} error={Boolean(error)} {...field}>
										<MenuItem value='work'>Пригоден</MenuItem>
										<MenuItem value='repair'>Пригоден</MenuItem>
										<MenuItem value='decommissioning'>Не пригоден</MenuItem>
									</Select>
								</FormControl>
							)}
						/>
					)
				case 'file':
					break
				case 'link':
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<TextField type='link' label={f.label} error={Boolean(error)} {...field} />
							)}
						/>
					)

				default:
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<TextField label={f.label} error={Boolean(error)} {...field} />
							)}
						/>
					)
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
