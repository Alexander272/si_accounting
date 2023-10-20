import { FC, PropsWithChildren } from 'react'
import { Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import dayjs from 'dayjs'

import { VerificationFields, type VerificationFormType } from '../fields'

const defaultValues: VerificationFormType = {
	verificationDate: dayjs(),
	//TODO надо как-то получать интервал поверок, чтобы считать эту дату
	nextVerificationDate: '',
	verificationFile: '',
	verificationLink: '',
	verificationStatus: '',
}

type Props = {
	onSubmit: () => void
}

export const VerificationForm: FC<PropsWithChildren<Props>> = ({ children, onSubmit }) => {
	const methods = useForm<VerificationFormType>({ defaultValues })

	const submitHandler = methods.handleSubmit(data => {
		if (!data.id) {
			console.log('submit', data)
		}
		onSubmit()
	})

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
				case 'file':
					break
				case 'link':
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
