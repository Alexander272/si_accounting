import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IInstrumentForm } from '@/components/Forms/NewInstrumentForm/type'
import type { Instrument } from '../types/instrument'
import {
	useGetLastVerificationQuery,
	useUpdateVerificationMutation,
} from '@/features/verification/verificationApiSlice'
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
	notVerified: false,
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
	const [updateVerification, { isLoading: isLoadingVerification }] = useUpdateVerificationMutation()

	const { data: verification } = useGetLastVerificationQuery(data.id || '', { skip: !data.id })

	const submitHandler = async (data: IInstrumentForm, isShouldUpdate?: boolean) => {
		if (!isShouldUpdate) {
			onSubmit && onSubmit()
			return
		}
		console.log('update instrument', data)
		if (data.notVerified) data.interVerificationInterval = ''

		try {
			if (data.notVerified && verification?.data) {
				const newVerification = {
					...verification.data,
					date: 0,
					nextDate: 0,
					notVerified: true,
				}
				await updateVerification(newVerification).unwrap()
			}

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
				defaultValues={data ? { ...data, notVerified: data.interVerificationInterval == '' } : defaultValues}
				disabled={isLoading || loading}
				onSubmit={submitHandler}
				submitLabel={submitLabel}
				cancelLabel={cancelLabel}
				onCancel={onCancel}
			/>

			{isLoading || isLoadingVerification ? <FormLoader /> : null}
		</Stack>
	)
}
