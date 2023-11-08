import { useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'

import { getSelectedItems, removeSelected } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { VerificationForm } from '../VerificationForm/VerificationForm'

export const NewVerification = () => {
	const selected = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { closeModal } = useModal()

	const { data } = useGetInstrumentByIdQuery(selected[0], { skip: !selected[0] })

	useEffect(() => {
		if (selected.length == 0) closeModal()
	}, [closeModal, selected])

	// const skipHandler = () => {
	// 	dispatch(removeSelected(selected[0]))
	// }

	const saveHandler = () => {
		dispatch(removeSelected(selected[0]))
	}

	if (!selected.length) return null

	return (
		<Box>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'} paddingX={2}>
				{/* Наименование инструмента:  */}
				{data?.data.name}
			</Typography>

			<VerificationForm instrumentId={selected[0]} onSubmit={saveHandler}>
				{/* <Button onClick={skipHandler} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
					Пропустить
				</Button> */}
				<Button variant='contained' type='submit' fullWidth sx={{ borderRadius: 3 }}>
					Сохранить
				</Button>
			</VerificationForm>
		</Box>
	)
}
