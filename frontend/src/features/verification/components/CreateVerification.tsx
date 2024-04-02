import { Stack, Typography } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { useGetLastVerificationQuery } from '../verificationApiSlice'
import { CreateVerificationForm } from './CreateVerificationForm'

export const CreateVerification = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	const { data: instrument, isLoading: isLoadingInstrument } = useGetInstrumentByIdQuery(active?.id || '', {
		skip: !active?.id,
	})
	const { data, isLoading } = useGetLastVerificationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	if (!instrument || isLoading || isLoadingInstrument) return <Fallback marginTop={5} marginBottom={3} height={450} />

	return (
		<Stack>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
				{instrument?.data.name} ({instrument.data.factoryNumber})
			</Typography>

			{!data && <Typography color={'red'}>Не удалось получить данные о поверке</Typography>}
			<CreateVerificationForm
				instrument={instrument?.data}
				initDate={data?.data.nextDate}
				onSubmit={closeModal}
				onCancel={closeModal}
			/>
		</Stack>
	)
}
