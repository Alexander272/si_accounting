import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IInstrumentForm } from '@/components/Forms/NewInstrumentForm/type'
import type { Instrument } from '../types/instrument'
import { FormLoader } from '@/components/Loader/FormLoader'
import { InstrumentForm } from '@/components/Forms/NewInstrumentForm/InstrumentForm'
import { useUpdateInstrumentMutation } from '../instrumentApiSlice'

const defaultValues: IInstrumentForm = {
	name: '',
	type: '',
	factoryNumber: '',
	measurementLimits: '',
	accuracy: '',
	stateRegister: '',
	manufacturer: '',
	yearOfIssue: '',
	interVerificationInterval: '12',
	notes: '',
}

type Props = {
	data: Instrument
	loading?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const UpdateInstrumentForm: FC<Props> = ({ data, loading, submitLabel, cancelLabel, onSubmit, onCancel }) => {
	const [update, { isLoading }] = useUpdateInstrumentMutation()

	const submitHandler = async (data: IInstrumentForm, isShouldUpdate?: boolean) => {
		if (!isShouldUpdate) {
			onSubmit && onSubmit()
			return
		}
		console.log('update instrument', data)

		try {
			await update(data).unwrap()
			onSubmit && onSubmit()
			// toast.success('Инструмент обновлен')
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	return (
		<Stack mt={2}>
			<InstrumentForm
				defaultValues={data || defaultValues}
				disabled={isLoading || loading}
				onSubmit={submitHandler}
				submitLabel={submitLabel}
				cancelLabel={cancelLabel}
				onCancel={onCancel}
			/>

			{isLoading && <FormLoader />}
		</Stack>
	)
}
