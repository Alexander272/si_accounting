import { useState } from 'react'
import { Box, Button } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useSaveSIMutation } from '@/features/dataTable/siApiSlice'
import { getActiveItem, setActive } from '@/features/dataTable/dataTableSlice'
import { Stepper } from '@/components/Stepper/Stepper'
import { useGetInstrumentByIdQuery } from '../InstrumentForm/instrumentApiSlice'
import { InstrumentForm } from '../InstrumentForm/InstrumentForm'
import { VerificationForm } from '../VerificationForm/VerificationForm'
import { LocationForm } from '../LocationForm/LocationForm'

const steps = [
	{ id: 'instrument', label: 'Информация о СИ' },
	{ id: 'verification', label: 'Поверка СИ' },
	{ id: 'place', label: 'Место нахождения СИ' },
]

export const CreateDataItem = () => {
	const [activeStep, setActiveStep] = useState(0)

	const active = useAppSelector(getActiveItem)

	const { data } = useGetInstrumentByIdQuery('draft')

	const [save] = useSaveSIMutation()

	const dispatch = useAppDispatch()

	const nextHandler = async () => {
		if (activeStep + 1 == steps.length) {
			dispatch(setActive())
			await save(data?.data.id || '').unwrap()
		}
		setActiveStep(prev => (prev + 1) % steps.length)
	}
	const prevHandler = () => {
		setActiveStep(prev => prev - 1)
	}

	return (
		<Box>
			<Stepper steps={steps} active={activeStep} />

			{activeStep == 0 && (
				<InstrumentForm onSubmit={nextHandler} draftId={active?.id}>
					<Button onClick={prevHandler} variant='outlined' fullWidth disabled>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						{activeStep === steps.length - 1 ? 'Сохранить' : 'Далее'}
					</Button>
				</InstrumentForm>
			)}
			{activeStep == 1 && (
				<VerificationForm onSubmit={nextHandler}>
					<Button onClick={prevHandler} variant='outlined' fullWidth>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						Далее
					</Button>
				</VerificationForm>
			)}
			{activeStep == 2 && (
				<LocationForm onSubmit={nextHandler} isNew status='reserve'>
					<Button onClick={prevHandler} variant='outlined' fullWidth>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						Сохранить
					</Button>
				</LocationForm>
			)}
		</Box>
	)
}
