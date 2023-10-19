import { FC } from 'react'
import { Stepper as BaseStepper, Step, StepLabel } from '@mui/material'
import { CustomConnector } from './stepper.style'
import { CustomStepIcon } from './Icon'

type Step = {
	id: string
	completed?: boolean
	label: string
}

type Props = {
	active?: number
	steps: Step[]
}

export const Stepper: FC<Props> = ({ active, steps }) => {
	return (
		<BaseStepper alternativeLabel activeStep={active} connector={<CustomConnector />}>
			{steps.map(step => (
				<Step key={step.id} completed={step.completed}>
					<StepLabel StepIconComponent={CustomStepIcon}>{step.label}</StepLabel>
				</Step>
			))}
		</BaseStepper>
	)
}
