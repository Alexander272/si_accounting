import { Box, Button, Typography } from '@mui/material'

import { getActiveItem, getSelectedItems, removeSelected } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { LocationForm } from '../LocationForm/LocationForm'

export const ChangeLocation = () => {
	const active = useAppSelector(getActiveItem)
	const selected = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { data } = useGetInstrumentByIdQuery(active || selected[0], { skip: !active && !selected[0] })

	const { closeModal } = useModal()

	const saveHandler = () => {
		if (active) closeModal()
		else dispatch(removeSelected(selected[0]))
		if (selected.length == 1) closeModal()
	}

	return (
		<Box>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'} paddingX={2}>
				{/* Наименование инструмента:  */}
				{data?.data.name}
			</Typography>

			<LocationForm onSubmit={saveHandler} instrumentId={active || selected[0]}>
				<Button onClick={closeModal} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
					Отмена
				</Button>
				<Button type='submit' variant='contained' fullWidth sx={{ borderRadius: 3 }}>
					Сохранить
				</Button>
			</LocationForm>
		</Box>
	)
}
