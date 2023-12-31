import { Button } from '@mui/material'

import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { useAppSelector } from '@/hooks/redux'
import { InstrumentForm } from '../InstrumentForm/InstrumentForm'

export const UpdateInstrument = () => {
	const active = useAppSelector(getActiveItem)

	const { closeModal } = useModal()

	return (
		<>
			<InstrumentForm onSubmit={closeModal} instrumentId={active}>
				<Button onClick={closeModal} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
					Отмена
				</Button>
				<Button variant='contained' type='submit' fullWidth sx={{ borderRadius: 3 }}>
					Сохранить
				</Button>
			</InstrumentForm>
		</>
	)
}
