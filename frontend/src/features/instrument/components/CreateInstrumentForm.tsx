import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IInstrumentForm } from '@/components/Forms/NewInstrumentForm/type'
import type { Instrument } from '../types/instrument'
import { FormLoader } from '@/components/Loader/FormLoader'
import { InstrumentForm } from '@/components/Forms/NewInstrumentForm/InstrumentForm'
import { useCreateInstrumentMutation } from '../instrumentApiSlice'

const defaultValues: IInstrumentForm = {
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
	data?: Instrument
	loading?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const CreateInstrumentForm: FC<Props> = ({ data, loading, submitLabel, cancelLabel, onSubmit, onCancel }) => {
	const [create, { isLoading }] = useCreateInstrumentMutation()

	//TODO я забыл отображать индикатор загрузки | i forgot show loading indicator

	const submitHandler = async (data: IInstrumentForm) => {
		console.log('create instrument', data)

		try {
			await create(data).unwrap()
			onSubmit && onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	// if (isLoading) return <Fallback marginTop={5} marginBottom={3} />
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
