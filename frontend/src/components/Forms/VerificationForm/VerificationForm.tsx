import { FC, PropsWithChildren } from 'react'
import { Stack, TextField } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import dayjs from 'dayjs'

import { VerificationFields, VerificationFormType } from '../fields'

const defaultValues: VerificationFormType = {
	verificationDate: dayjs().format('DD.MM.YYYY'),
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
		console.log('submit', data)
		onSubmit()
	})

	const renderFields = () => {
		return VerificationFields.map(f => {
			switch (f.type) {
				case 'date':
					break
				case 'file':
					break
				case 'link':
					break
				default:
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, formState: { errors } }) => (
								<TextField label={f.label} error={Boolean(errors[f.key])} {...field} />
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
