import { FC } from 'react'
import { Button, Stack } from '@mui/material'

import type { HiddenField, ILocationForm } from './type'
import { LocationInputs } from './LocationInputs'
import { FormProvider, useForm } from 'react-hook-form'

type Props = {
	defaultValues: ILocationForm
	hidden?: HiddenField
	disabled?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit: (data: ILocationForm, isShouldUpdate?: boolean) => void
}

export const LocationForm: FC<Props> = ({
	defaultValues,
	hidden,
	disabled,
	submitLabel,
	cancelLabel,
	onCancel,
	onSubmit,
}) => {
	const methods = useForm<ILocationForm>({
		values: defaultValues,
		// defaultValues: { ...defaultValues, needConfirmed: status != 'used' },
	})

	const isToReserve = methods.watch('isToReserve')

	const hide = { ...hidden, department: hidden?.department || isToReserve, person: hidden?.person || isToReserve }

	const submitHandler = methods.handleSubmit(data => {
		onSubmit(data, Boolean(Object.keys(methods.formState.dirtyFields).length))
	})

	return (
		<Stack component={'form'} onSubmit={submitHandler}>
			<FormProvider {...methods}>
				<LocationInputs hidden={hide} />
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
