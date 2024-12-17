import { Stack, Typography } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getSelected, setSelected } from '@/features/dataTable/dataTableSlice'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { useGetLastVerificationQuery } from '../verificationApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { CreateVerificationForm } from './CreateVerificationForm'
import { useModal } from '@/features/modal/hooks/useModal'

export const CreateSeveralVerification = () => {
	const selected = useAppSelector(getSelected)
	const dispatch = useAppDispatch()

	const { closeModal } = useModal()

	const selectedItems = Object.values(selected)

	const { data: instrument, isFetching: isLoadingInstrument } = useGetInstrumentByIdQuery(
		selectedItems[0]?.id || '',
		{
			skip: !selectedItems[0]?.id,
		}
	)
	const { data, isFetching } = useGetLastVerificationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	const submitHandler = () => {
		dispatch(setSelected(selectedItems[0]))
		if (selectedItems.length == 1) {
			closeModal()
			return
		}
	}

	if (isFetching || isLoadingInstrument) return <Fallback marginTop={5} marginBottom={3} height={250} />
	if (!instrument) return <Typography>Не удалось загрузить данные</Typography>
	if (data?.data.notVerified) return <Typography>Инструмент отмечен как не нуждающийся в поверках</Typography>
	return (
		<Stack>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
				{instrument?.data.name} ({instrument.data.factoryNumber})
			</Typography>

			{!data && <Typography color={'red'}>Не удалось получить данные о поверке</Typography>}
			<CreateVerificationForm
				instrument={instrument?.data}
				initDate={data?.data.nextDate}
				onSubmit={submitHandler}
				onCancel={closeModal}
			/>
		</Stack>
	)
}
