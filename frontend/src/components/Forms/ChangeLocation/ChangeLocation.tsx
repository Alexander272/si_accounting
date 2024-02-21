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

	const { data } = useGetInstrumentByIdQuery(active?.id || selected[0]?.id, { skip: !active && !selected[0] })

	const { closeModal } = useModal()

	const saveHandler = () => {
		if (active) closeModal()
		else {
			if (selected.length == 1) closeModal()
			dispatch(removeSelected(selected[0].id))
		}
	}

	return (
		<Box>
			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'} paddingX={2}>
				{/* Наименование инструмента:  */}
				{data?.data.name}
			</Typography>

			<LocationForm
				onSubmit={saveHandler}
				instrumentId={active?.id || selected[0]?.id || 'skip'}
				status={active?.status || selected[0]?.status}
			>
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отмена
				</Button>
				<Button type='submit' variant='contained' fullWidth>
					Сохранить
				</Button>
			</LocationForm>
		</Box>
	)
}
