import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { Instrument } from '@/features/instrument/types/instrument'
import type { IVerificationForm } from '@/components/Forms/NewVerificationForm/type'
import type { IVerification } from '../types/verification'
import { DraftKey } from '@/constants/localKeys'
import { VerificationStatuses } from '@/constants/verification'
import { FormLoader } from '@/components/Loader/FormLoader'
import { VerificationForm } from '@/components/Forms/NewVerificationForm/VerificationForm'
import { useUpdateVerificationMutation } from '../verificationApiSlice'

const defaultValues: IVerificationForm = {
	date: dayjs().startOf('d').unix(),
	nextDate: dayjs().startOf('d').unix(),
	registerLink: '',
	notVerified: false,
	status: 'work',
	notes: '',
}

type Props = {
	instrument: Instrument
	data: IVerification
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const UpdateVerificationForm: FC<Props> = ({
	instrument,
	data,
	submitLabel,
	cancelLabel,
	onCancel,
	onSubmit,
}) => {
	const [update, { isLoading }] = useUpdateVerificationMutation()

	const submitHandler = async (data: IVerificationForm, isShouldUpdate?: boolean) => {
		if (!isShouldUpdate) {
			onSubmit && onSubmit()
			return
		}
		console.log('update verification', data)

		const verification: IVerification = {
			...data,
			nextDate: data.status != VerificationStatuses.Decommissioning ? data.nextDate : 0,
			instrumentId: instrument.id || '',
			isDraftInstrument: instrument.status == DraftKey,
		}

		try {
			await update(verification).unwrap()
			onSubmit && onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	return (
		<Stack mt={2}>
			<VerificationForm
				instrumentId={instrument?.id || ''}
				stepMonth={+(instrument.interVerificationInterval || 0)}
				defaultValues={data || defaultValues}
				disabled={isLoading}
				onSubmit={submitHandler}
				submitLabel={submitLabel}
				cancelLabel={cancelLabel}
				onCancel={onCancel}
			/>

			{isLoading && <FormLoader />}
		</Stack>
	)
}
