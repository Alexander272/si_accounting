import { Button, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppSelector } from '@/hooks/redux'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { Confirm } from '@/components/Confirm/Confirm'
import { useDeleteLocationMutation, useGetLastLocationQuery } from '../locationApiSlice'

export const DeleteLocation = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()
	const { data: instrument, isFetching } = useGetInstrumentByIdQuery(active?.id || '', {
		skip: !active?.id,
	})
	const { data } = useGetLastLocationQuery(active?.id || '', { skip: !active?.id })
	const [remove] = useDeleteLocationMutation()

	const deleteHandler = async () => {
		if (!data?.data.id) return

		try {
			await remove(data?.data.id).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	if (isFetching) return <Fallback marginTop={5} marginBottom={3} height={350} />
	return (
		<Stack>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
				{instrument?.data.name} ({instrument?.data.factoryNumber})
			</Typography>

			<Typography mt={2} fontSize={'1.1rem'}>
				Удалить перемещение?
			</Typography>

			<Stack direction={'row'} spacing={3} mt={4}>
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отменить
				</Button>
				<Confirm
					width='100%'
					onClick={deleteHandler}
					confirmText='Вы уверены, что хотите удалить перемещение?'
					buttonComponent={
						<Button variant='contained' fullWidth>
							Да
						</Button>
					}
				/>
			</Stack>
		</Stack>
	)
}
