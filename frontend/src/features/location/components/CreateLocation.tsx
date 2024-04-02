import { Button, Stack, Typography, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { Confirm } from '@/components/Confirm/Confirm'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { useDeleteLocationMutation, useGetLastLocationQuery } from '../locationApiSlice'
import { CreateLocationForm } from './CreateLocationForm'

export const CreateLocation = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	const { data: instrument, isLoading: isLoadingInstrument } = useGetInstrumentByIdQuery(active?.id || '', {
		skip: !active?.id,
	})

	if (!instrument || isLoadingInstrument) return <Fallback marginTop={5} marginBottom={3} height={450} />

	return (
		<Stack>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
				{instrument?.data.name} ({instrument.data.factoryNumber})
			</Typography>

			{active?.status == 'moved' && <DeleteForm instrumentId={instrument.data.id} />}
			{active?.status == 'used' && (
				<>
					<Typography mt={2}>Переместить инструмент в резерв?</Typography>
					<CreateLocationForm
						instrument={instrument?.data}
						hidden={{
							department: true,
							person: true,
							dateOfIssue: true,
							needConfirmed: true,
							isToReserve: true,
						}}
						status='reserve'
						onSubmit={closeModal}
						submitLabel='Да'
						onCancel={closeModal}
					/>
				</>
			)}
			{active?.status == 'reserve' && (
				<CreateLocationForm
					instrument={instrument?.data}
					hidden={{ isToReserve: true }}
					onSubmit={closeModal}
					onCancel={closeModal}
				/>
			)}
		</Stack>
	)
}

type DeleteProps = {
	instrumentId?: string
}

const DeleteForm = ({ instrumentId }: DeleteProps) => {
	const { closeModal } = useModal()
	const { palette } = useTheme()

	const [deleteLocation] = useDeleteLocationMutation()
	const { data, isLoading } = useGetLastLocationQuery(instrumentId || '', { skip: !instrumentId })

	const deleteHandler = async () => {
		if (!data?.data.id) return

		try {
			await deleteLocation(data?.data.id).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	if (isLoading) return <Fallback marginTop={5} marginBottom={3} />

	if (!instrumentId)
		return (
			<Typography mt={2} fontSize={'1.1rem'}>
				Не удалось загрузить данные.
			</Typography>
		)

	return (
		<>
			<Typography mt={2} fontSize={'1.1rem'}>
				Местоположение инструмента не подтверждено. Удалить перемещение?
			</Typography>

			<Stack direction={'row'} spacing={3} mt={4}>
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отменить
				</Button>
				<Confirm
					onClick={deleteHandler}
					fullWidth
					buttonComponent={
						<Button variant='contained' fullWidth>
							Да
						</Button>
					}
				>
					<Stack spacing={1} direction={'row'} justifyContent={'center'} alignItems={'center'} mb={1}>
						<WarningIcon fill={palette.error.main} />
						<Typography fontSize={'1.1rem'} fontWeight={'bold'} align='center'>
							Удаление
						</Typography>
					</Stack>

					<Typography maxWidth={260} align='center'>
						Вы уверены, что хотите удалить перемещение?
					</Typography>
				</Confirm>
			</Stack>
		</>
	)
}
