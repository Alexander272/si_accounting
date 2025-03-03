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
import { useCreateLocationMutation, useGetLastLocationQuery } from '../locationApiSlice'

const defaultValues: ILocationForm = {
	needConfirmed: false,
	isToReserve: false,
	department: '',
	person: '',
	dateOfIssue: dayjs().startOf('d').unix(),
}

type Props = {
	status?: Status
	hidden?: HiddenField
	notRequired?: HiddenField
	instrument: Instrument
	loading?: boolean
	submitLabel?: string
	cancelLabel?: string
	onCancel?: () => void
	onSubmit?: () => void
}

export const CreateLocationForm: FC<Props> = ({
	status,
	hidden,
	notRequired,
	instrument,
	loading,
	submitLabel,
	cancelLabel,
	onSubmit,
	onCancel,
}) => {
	const [create, { isLoading }] = useCreateLocationMutation()
	const { data } = useGetLastLocationQuery(instrument?.id || '', { skip: !instrument?.id })

	const submitHandler = async (form: ILocationForm) => {
		console.log('create location', form)

		if (form.dateOfIssue < (data?.data?.dateOfIssue || 0)) {
			toast.error('Текущая дата выдачи инструмента меньше предыдущей')
			return
		}

		const location: Location = {
			department: form.isToReserve ? '' : form.department,
			person: form.isToReserve ? '' : form.person,
			dateOfIssue: form.dateOfIssue,
			needConfirmed: form.needConfirmed,
			instrumentId: instrument.id || '',
			status: !form.needConfirmed ? (form.isToReserve ? 'reserve' : 'used') : 'moved',
			dateOfReceiving: !form.needConfirmed || form.isToReserve ? form.dateOfIssue : 0,
		}

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
				defaultValues={defaultValues}
				hidden={hidden}
				notRequired={notRequired}
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
