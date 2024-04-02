import { useState } from 'react'
import { Box, Button, MenuItem, Select, type SelectChangeEvent, Stack, Typography, useTheme } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { DeleteIcon } from '@/components/Icons/DeleteIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { InstrumentForm } from '../InstrumentForm/InstrumentForm'
import { VerificationForm } from '../VerificationForm/VerificationForm'

const steps = [
	{ id: 'instrument', label: 'Информация о СИ' },
	{ id: 'verification', label: 'Поверка СИ' },
	// { id: 'place', label: 'Место нахождения СИ' },
]

export const UpdateDataItem = () => {
	const [activeForm, setActiveForm] = useState('instrument')

	const active = useAppSelector(getActiveItem)

	const setFormHandler = (event: SelectChangeEvent<string>) => {
		setActiveForm(event.target.value)
	}

	const { palette } = useTheme()

	const { closeModal } = useModal()

	const deleteHandler = () => {
		console.log('delete')
	}

	return (
		<Box>
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

				{activeForm == 'instrument' && (
					<Confirm
						onClick={deleteHandler}
						buttonComponent={
							<Button variant='outlined' color='error'>
								<DeleteIcon fontSize={18} color={palette.error.main} />
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
							Вы уверены, что хотите удалить инструмент?
						</Typography>
					</Confirm>
				)}
			</Stack>

			{activeForm == 'instrument' && (
				<InstrumentForm onSubmit={closeModal} instrumentId={active?.id}>
					<Button onClick={closeModal} variant='outlined' fullWidth>
						Отмена
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						Сохранить
					</Button>
				</InstrumentForm>
			)}

			{activeForm == 'verification' && (
				<VerificationForm onSubmit={closeModal} instrumentId={active?.id}>
					<Button onClick={closeModal} variant='outlined' fullWidth>
						Отмена
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						Сохранить
					</Button>
				</VerificationForm>
			)}
		</Box>
	)
}
