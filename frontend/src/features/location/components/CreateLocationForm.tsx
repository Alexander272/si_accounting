import { FC } from 'react'
import { Stack } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { Instrument } from '@/features/instrument/types/instrument'
import type { Status } from '@/features/dataTable/types/data'
import type { HiddenField, ILocationForm } from '@/components/Forms/NewLocationForm/type'
import type { Location } from '../types/location'
import { FormLoader } from '@/components/Loader/FormLoader'
import { LocationForm } from '@/components/Forms/NewLocationForm/LocationForm'
import { useCreateLocationMutation } from '../locationApiSlice'

const defaultValues: ILocationForm = {
	needConfirmed: false,
	isToReserve: false,
	department: '',
	person: '',
	dateOfIssue: dayjs().startOf('d').unix(),
}

type Props = {
	// data?: Location
	status?: Status
	hidden?: HiddenField
	instrument: Instrument
	loading?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const CreateLocationForm: FC<Props> = ({
	// data,
	status,
	hidden,
	instrument,
	loading,
	submitLabel,
	cancelLabel,
	onSubmit,
	onCancel,
}) => {
	const [create, { isLoading }] = useCreateLocationMutation()

	const submitHandler = async (form: ILocationForm) => {
		console.log('create location', form)

		const location: Location = {
			department: form.isToReserve ? '' : form.department,
			person: form.isToReserve ? '' : form.person,
			dateOfIssue: form.dateOfIssue,
			needConfirmed: form.needConfirmed,
			instrumentId: instrument.id || '',
			// status: data?.status || '',
			status: !form.needConfirmed ? (form.isToReserve ? 'reserve' : 'used') : 'moved',
			// dateOfReceiving: data?.dateOfReceiving || 0,
			dateOfReceiving: !form.needConfirmed || form.isToReserve ? form.dateOfIssue : 0,
		}

		// console.log(location)

		try {
			await create(location).unwrap()
			onSubmit && onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	if (status == 'reserve') defaultValues.isToReserve = true
	else defaultValues.isToReserve = false

	return (
		<Stack mt={2}>
			<LocationForm
				// defaultValues={data || defaultValues}
				defaultValues={defaultValues}
				hidden={hidden}
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
