import { Button, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppSelector } from '@/hooks/redux'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { Fallback } from '@/components/Fallback/Fallback'
import { useForcedReceiptMutation } from '../locationApiSlice'

export const ForcedReceiptForm = () => {
	const active = useAppSelector(getActiveItem)
	const { closeModal } = useModal()
	const [receipt, { isLoading }] = useForcedReceiptMutation()

	const receiveHandler = async () => {
		if (!active) return
		try {
			await receipt({ instrumentId: active.id }).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	return (
		<Stack spacing={2} alignItems={'center'} position={'relative'}>
			{isLoading && (
				<Fallback
					position={'absolute'}
					top={'50%'}
					left={'50%'}
					transform={'translate(-50%, -50%)'}
					height={160}
					width={160}
					borderRadius={3}
					zIndex={15}
					backgroundColor={'#fafafa'}
				/>
			)}

			<Typography width={'100%'}>
				Подтвердите проставление отметки о получении инструмента «{active?.name}» ({active?.factoryNumber})
			</Typography>

			<Button onClick={receiveHandler} variant='outlined' sx={{ width: 300 }}>
				Подтвердить
			</Button>
		</Stack>
	)
}
