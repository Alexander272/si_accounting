import { Box, Button, Typography } from '@mui/material'

import { getActiveItem, getSelectedItems, removeSelected } from '@/features/dataTable/dataTableSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { VerificationForm } from '../VerificationForm/VerificationForm'

export const NewVerification = () => {
	const active = useAppSelector(getActiveItem)
	const selected = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { data } = useGetInstrumentByIdQuery(active || selected[0], { skip: !active && !selected[0] })

	const saveHandler = () => {
		dispatch(removeSelected(selected[0]))
	}

	return (
		<Box>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'} paddingX={2}>
				{/* Наименование инструмента:  */}
				{data?.data.name}
			</Typography>

			<VerificationForm instrumentId={active || selected[0]} onSubmit={saveHandler}>
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
