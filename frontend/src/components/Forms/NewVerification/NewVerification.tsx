import { Box, Button, Typography } from '@mui/material'

import { getActiveItem, getSelectedItems, removeSelected } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { VerificationForm } from '../VerificationForm/VerificationForm'

export const NewVerification = () => {
	const active = useAppSelector(getActiveItem)
	const selected = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { closeModal } = useModal()

	const { data } = useGetInstrumentByIdQuery(active?.id || selected[0]?.id, { skip: !active && !selected[0] })

	const saveHandler = () => {
		if (active) closeModal()
		else dispatch(removeSelected(selected[0].id))
		if (selected.length == 1) closeModal()
	}

	return (
		<Box>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'} paddingX={2}>
				{/* Наименование инструмента: */}
				{data?.data.name}
			</Typography>

			<VerificationForm instrumentId={active?.id || selected[0]?.id || 'skip'} onSubmit={saveHandler}>
				{/* <Button onClick={skipHandler} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
					Пропустить
				</Button> */}
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отмена
				</Button>
				<Button variant='contained' type='submit' fullWidth>
					Сохранить
				</Button>
			</VerificationForm>
		</Box>
	)
}
