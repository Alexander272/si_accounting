import { FC } from 'react'
import { Button, Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import type { IVerificationForm, HiddenField } from './type'
import { VerificationInputs } from './VerificationInputs'

type Props = {
	defaultValues: IVerificationForm
	instrumentId: string
	stepMonth: number
	hidden?: HiddenField
	disabled?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit: (data: IVerificationForm, isShouldUpdate?: boolean) => void
}

export const VerificationForm: FC<Props> = ({
	defaultValues,
	instrumentId,
	stepMonth,
	disabled,
	hidden,
	submitLabel,
	cancelLabel,
	onSubmit,
	onCancel,
}) => {
	const methods = useForm<IVerificationForm>({
		values: defaultValues,
		// defaultValues: { ...defaultValues, needConfirmed: status != 'used' },
	})

	const submitHandler = methods.handleSubmit(data => {
		onSubmit(data, Boolean(Object.keys(methods.formState.dirtyFields).length))
	})

	return (
		<Stack component={'form'} onSubmit={submitHandler}>
			<FormProvider {...methods}>
				<VerificationInputs
					disabled={disabled}
					stepMonth={stepMonth}
					instrumentId={instrumentId}
					verificationId={defaultValues.id || ''}
					hidden={hidden}
				/>
			</FormProvider>

			<Stack direction={'row'} spacing={3} mt={4}>
				{onCancel && (
					<Button onClick={onCancel} variant='outlined' fullWidth disabled={disabled}>
						{cancelLabel ? cancelLabel : 'Отменить'}
					</Button>
				)}
				<Button variant='contained' type='submit' fullWidth disabled={disabled}>
					{submitLabel ? submitLabel : 'Сохранить'}
				</Button>
			</Stack>
		</Stack>
	)
}
