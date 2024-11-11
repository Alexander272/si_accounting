import { FC, useState } from 'react'
import { Select, type SelectChangeEvent, Stack, MenuItem, Button, Typography, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useDeleteInstrumentMutation, useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { useGetLastVerificationQuery } from '@/features/verification/verificationApiSlice'
import { UpdateInstrumentForm } from '@/features/instrument/components/UpdateInstrumentForm'
import { UpdateVerificationForm } from '@/features/verification/components/UpdateVerificationForm'
import { FileDeleteIcon } from '@/components/Icons/FileDeleteIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { Fallback } from '@/components/Fallback/Fallback'

const steps = [
	{ id: 'instrument', label: 'Информация о СИ' },
	{ id: 'verification', label: 'Поверка СИ' },
	// { id: 'place', label: 'Место нахождения СИ' },
]

export const UpdateSi = () => {
	const [activeForm, setActiveForm] = useState(steps[0].id)

	const { palette } = useTheme()
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	const { data } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })
	const [deleteDraft] = useDeleteInstrumentMutation()

	const setFormHandler = (event: SelectChangeEvent<string>) => {
		setActiveForm(event.target.value)
	}

	const deleteHandler = async () => {
		if (!data?.data) return

		try {
			await deleteDraft(data?.data).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<Stack spacing={2}>
			<Stack direction={'row'} spacing={2}>
				<Select
					variant='standard'
					value={activeForm}
					onChange={setFormHandler}
					sx={{ textAlign: 'center', width: '100%' }}
				>
					{steps.map(s => (
						<MenuItem key={s.id} value={s.id} sx={{ justifyContent: 'center' }}>
							{s.label}
						</MenuItem>
					))}
				</Select>

				<Confirm
					onClick={deleteHandler}
					confirmText='Вы уверены, что хотите удалить инструмент?'
					buttonComponent={
						<Button variant='outlined' color='error'>
							<FileDeleteIcon fontSize={20} fill={palette.error.main} />
						</Button>
					}
				/>
				{/* <Stack spacing={1} direction={'row'} justifyContent={'center'} alignItems={'center'} mb={1}>
						<WarningIcon fill={palette.error.main} />
						<Typography fontSize={'1.1rem'} fontWeight={'bold'} align='center'>
							Удаление
						</Typography>
					</Stack>

					<Typography maxWidth={260} align='center'>
						Вы уверены, что хотите удалить инструмент?
					</Typography>
				</Confirm> */}
			</Stack>

			{activeForm == steps[0].id && <InstrumentForm />}
			{activeForm == steps[1].id && <VerificationForm />}
		</Stack>
	)
}

const InstrumentForm: FC = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	const { data, isLoading } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })

	if (isLoading) return <Fallback marginTop={5} marginBottom={3} height={450} />

	if (!data) return <Typography color={'red'}>Не удалось получить данные об инструменте</Typography>
	return <UpdateInstrumentForm data={data?.data} onSubmit={closeModal} onCancel={closeModal} />
}

const VerificationForm: FC = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	const { data: instrument, isLoading: isLoadingInstrument } = useGetInstrumentByIdQuery(active?.id || '', {
		skip: !active?.id,
	})
	const { data, isLoading } = useGetLastVerificationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	if (!instrument || isLoading || isLoadingInstrument) return <Fallback marginTop={5} marginBottom={3} height={450} />

	if (!data) return <Typography color={'red'}>Не удалось получить данные о поверке</Typography>
	return (
		<UpdateVerificationForm
			instrument={instrument?.data}
			data={data.data}
			onSubmit={closeModal}
			onCancel={closeModal}
		/>
	)
}
