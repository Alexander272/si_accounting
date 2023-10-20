import { Box, Button } from '@mui/material'

import { InstrumentForm } from '../InstrumentForm/InstrumentForm'
import { Stepper } from '@/components/Stepper/Stepper'
import { useState } from 'react'
import { VerificationForm } from '../VerificationForm/VerificationForm'
import { LocationForm } from '../LocationForm/LocationForm'

const steps = [
	{ id: 'instrument', label: 'Информация о СИ' },
	{ id: 'verification', label: 'Поверка СИ' },
	{ id: 'place', label: 'Место нахождения СИ' },
]

export const CreateDataItem = () => {
	const [active, setActive] = useState(0)

	const nextHandler = () => {
		if (active + 1 == steps.length) {
			// TODO отправить запрос на сохранение всех черновиков
		}
		setActive(prev => (prev + 1) % steps.length)
	}
	const prevHandler = () => {
		setActive(prev => prev - 1)
	}

	return (
		<Box>
			<Stepper steps={steps} active={active} />

			{active == 0 && (
				<InstrumentForm onSubmit={nextHandler}>
					{/* //TODO надо как-то понимать заполнял ли пользователь форму или нет (чтобы не сохранять два раза одно и тоже) */}
					<Button onClick={prevHandler} variant='outlined' fullWidth disabled sx={{ borderRadius: 3 }}>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth sx={{ borderRadius: 3 }}>
						{active === steps.length - 1 ? 'Сохранить' : 'Далее'}
					</Button>
				</InstrumentForm>
			)}
			{active == 1 && (
				<VerificationForm onSubmit={nextHandler}>
					<Button onClick={prevHandler} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth sx={{ borderRadius: 3 }}>
						Далее
					</Button>
				</VerificationForm>
			)}
			{active == 2 && (
				<LocationForm onSubmit={nextHandler}>
					<Button onClick={prevHandler} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
						Назад
					</Button>
					<Button variant='contained' type='submit' fullWidth sx={{ borderRadius: 3 }}>
						Сохранить
					</Button>
				</LocationForm>
			)}
		</Box>
	)
}
