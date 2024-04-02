import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { Instrument } from '@/features/instrument/types/instrument'
import type { IVerificationForm } from '@/components/Forms/NewVerificationForm/type'
import type { IVerification } from '../types/verification'
import { DraftKey } from '@/constants/localKeys'
import { FormLoader } from '@/components/Loader/FormLoader'
import { VerificationForm } from '@/components/Forms/NewVerificationForm/VerificationForm'
import { useCreateVerificationMutation } from '../verificationApiSlice'

const defaultValues: IVerificationForm = {
	date: dayjs().unix(),
	nextDate: dayjs().add(12, 'M').subtract(1, 'd').unix(),
	registerLink: '',
	status: 'work',
	notes: '',
}

type Props = {
	instrument: Instrument
	initDate?: number
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const CreateVerificationForm: FC<Props> = ({
	instrument,
	initDate,
	submitLabel,
	cancelLabel,
	onSubmit,
	onCancel,
}) => {
	const [create, { isLoading }] = useCreateVerificationMutation()

	const submitHandler = async (data: IVerificationForm) => {
		console.log('create verification', data)

		const verification: IVerification = {
			...data,
			instrumentId: instrument.id || '',
			isDraftInstrument: instrument.status == DraftKey,
		}

		try {
			await create(verification).unwrap()
			onSubmit && onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	if (initDate) defaultValues.date = initDate
	defaultValues.nextDate = dayjs(defaultValues.date * 1000)
		.add(+(instrument.interVerificationInterval || 12), 'M')
		.subtract(1, 'd')
		.unix()

	return (
		<Stack mt={2}>
			<VerificationForm
				instrumentId={instrument.id || ''}
				stepMonth={+(instrument.interVerificationInterval || 0)}
				defaultValues={defaultValues}
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
