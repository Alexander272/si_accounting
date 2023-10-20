import { FC, PropsWithChildren } from 'react'
import { Stack, TextField } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import dayjs from 'dayjs'

import { type InstrumentFormType, InstrumentFields } from '../fields'

const defaultValues: InstrumentFormType = {
	name: '',
	type: '',
	factoryNumber: '',
	measurementLimits: '',
	accuracy: '',
	stateRegister: '',
	manufacturer: '',
	yearOfIssue: dayjs().get('year').toString(),
	interVerificationInterval: '12',
	notes: '',
}

type Props = {
	onSubmit: () => void
}

export const InstrumentForm: FC<PropsWithChildren<Props>> = ({ children, onSubmit }) => {
	const methods = useForm<InstrumentFormType>({ defaultValues })

	const submitHandler = methods.handleSubmit(data => {
		if (!data.id) {
			console.log('submit', data)
		}
		onSubmit()
	})

	const renderFields = () => {
		return InstrumentFields.map(f => {
			switch (f.type) {
				case 'number':
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<TextField label={f.label} type='number' error={Boolean(error)} {...field} />
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
