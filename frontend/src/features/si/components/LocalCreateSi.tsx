import { useEffect, useState } from 'react'
import { Button, Stack, Tooltip, useTheme } from '@mui/material'
import dayjs from 'dayjs'

import type { IInstrumentForm } from '@/components/Forms/NewInstrumentForm/type'
import type { IVerificationForm } from '@/components/Forms/NewVerificationForm/type'
import type { ILocationForm } from '@/components/Forms/NewLocationForm/type'
import type { INewSI } from '@/features/dataTable/types/si'
import { localKeys } from '@/constants/localKeys'
import { VerificationStatuses } from '@/constants/verification'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { useCreateSIMutation } from '@/features/dataTable/siApiSlice'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { getActiveItem, setActive } from '@/features/dataTable/dataTableSlice'
import { InstrumentForm } from '@/components/Forms/NewInstrumentForm/InstrumentForm'
import { VerificationForm } from '@/components/Forms/NewVerificationForm/VerificationForm'
import { LocationForm } from '@/components/Forms/NewLocationForm/LocationForm'
import { Stepper } from '@/components/Stepper/Stepper'
import { FileDeleteIcon } from '@/components/Icons/FileDeleteIcon'
import { Fallback } from '@/components/Fallback/Fallback'
import { FormLoader } from '@/components/Loader/FormLoader'

const steps = [
	{ id: 'instrument', number: 0, label: 'Информация о СИ', skip: false },
	{ id: 'verification', number: 1, label: 'Поверка СИ', skip: false },
	{ id: 'place', number: 2, label: 'Место нахождения СИ', skip: false },
]
const InstrumentData: IInstrumentForm = {
	name: '',
	type: '',
	factoryNumber: '',
	measurementLimits: '',
	accuracy: '',
	stateRegister: '',
	manufacturer: '',
	yearOfIssue: dayjs().get('year').toString(),
	notVerified: false,
	interVerificationInterval: '12',
	notes: '',
}
const VerificationData: IVerificationForm = {
	date: dayjs().startOf('d').unix(),
	nextDate: dayjs().startOf('d').add(12, 'M').subtract(1, 'd').unix(),
	registerLink: '',
	status: 'work',
	notVerified: false,
	notes: '',
}
const LocationData: ILocationForm = {
	needConfirmed: false,
	isToReserve: false,
	department: '',
	person: '',
	dateOfIssue: dayjs().startOf('d').unix(),
}

export const LocalCreateSi = () => {
	const [instrument, setInstrument] = useState<IInstrumentForm>(
		JSON.parse(localStorage.getItem(localKeys.instrument) || 'null') || InstrumentData
	)
	const [verification, setVerification] = useState<IVerificationForm>(
		JSON.parse(localStorage.getItem(localKeys.verification) || 'null') || VerificationData
	)
	const [location, setLocation] = useState<ILocationForm>(
		JSON.parse(localStorage.getItem(localKeys.location) || 'null') || LocationData
	)
	const [activeStep, setActiveStep] = useState(0)

	const { closeModal } = useModal()

	const { palette } = useTheme()

	const active = useAppSelector(getActiveItem)
	const { data, isLoading } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })
	const [create, { isLoading: creating }] = useCreateSIMutation()

	const dispatch = useAppDispatch()

	useEffect(() => {
		if (data) {
			// instrument = data?.data
			setInstrument({ ...data.data, notVerified: data.data.interVerificationInterval == '', id: '' })
			dispatch(setActive())
			localStorage.setItem(localKeys.instrument, JSON.stringify(data.data))
		}
	}, [data, dispatch])

	const deleteHandler = () => {
		console.log('delete')
		localStorage.removeItem(localKeys.instrument)
		localStorage.removeItem(localKeys.verification)
		localStorage.removeItem(localKeys.location)
		setInstrument(InstrumentData)
		setVerification(VerificationData)
		setLocation(LocationData)
		setActiveStep(0)
	}

	const changeStepHandler = async (isNext: boolean = true) => {
		if (activeStep == 0 && !isNext) {
			closeModal()
			return
		}

		let count = 1
		if (steps[(activeStep + 1) % steps.length]?.skip || steps[activeStep - 1]?.skip) count = 2

		if (isNext) {
			// if (activeStep + 1 == steps.length) {
			// }
			setActiveStep(prev => (prev + count) % steps.length)
		} else setActiveStep(prev => prev - count)
	}

	const submitHandler = (key: string) => async (data: unknown, isShouldUpdate?: boolean) => {
		console.log(key, 'data', data, 'update', isShouldUpdate)
		localStorage.setItem(key, JSON.stringify(data))
		if (key == localKeys.instrument) {
			const temp = data as IInstrumentForm
			setInstrument({
				...temp,
				interVerificationInterval: temp.notVerified ? '' : temp.interVerificationInterval,
			})
			if ((temp as IInstrumentForm).notVerified) {
				steps[1].skip = true
				setVerification({ ...VerificationData, notVerified: true })
			} else steps[1].skip = false
		}
		if (key == localKeys.verification) setVerification(data as IVerificationForm)
		if (key == localKeys.location) {
			// setLocation(data as ILocationForm)
			const location = data as ILocationForm

			const si: INewSI = {
				instrument: {
					name: instrument.name.trim(),
					type: instrument.type.trim(),
					factoryNumber: instrument.factoryNumber.trim(),
					measurementLimits: instrument.measurementLimits.trim(),
					accuracy: instrument.accuracy.trim(),
					stateRegister: instrument.stateRegister.trim(),
					manufacturer: instrument.manufacturer.trim(),
					yearOfIssue: instrument.yearOfIssue,
					interVerificationInterval: instrument.interVerificationInterval,
					notes: instrument.notes.trim(),
				},
				verification: {
					instrumentId: '',
					date: verification.date,
					nextDate: verification.status != VerificationStatuses.Decommissioning ? verification.nextDate : 0,
					registerLink: verification.registerLink.trim(),
					status: verification.status,
					notVerified: verification.notVerified,
					notes: verification.notes.trim(),
				},
				location: {
					instrumentId: '',
					department: location.isToReserve ? '' : location.department,
					person: location.isToReserve ? '' : location.person,
					dateOfIssue: location.dateOfIssue,
					dateOfReceiving: !location.needConfirmed || location.isToReserve ? location.dateOfIssue : 0,
					needConfirmed: location.needConfirmed,
					status: location.needConfirmed ? 'moved' : location.isToReserve ? 'reserve' : 'used',
				},
			}
			console.log(si)

			await create(si).unwrap()
			deleteHandler()
		} else {
			changeStepHandler()
		}
	}
	const cancelHandler = () => changeStepHandler(false)

	if (isLoading) return <Fallback marginTop={5} marginBottom={3} />
	return (
		<Stack>
			<Stack direction={'row'} width={'100%'} alignItems={'center'} mb={1.5}>
				<Stepper steps={steps} active={activeStep} sx={{ width: '100%' }} />

				<Tooltip title='Удалить черновик'>
					<span>
						<Button variant='outlined' color='error' onClick={deleteHandler} disabled={!instrument}>
							<FileDeleteIcon
								fill={!instrument ? palette.action.disabled : palette.error.main}
								fontSize={22}
							/>
						</Button>
					</span>
				</Tooltip>
			</Stack>

			<Stack mt={2}>
				{creating && <FormLoader />}

				{activeStep == 0 && (
					<InstrumentForm
						defaultValues={instrument}
						onSubmit={submitHandler(localKeys.instrument)}
						submitLabel='Далее'
						onCancel={cancelHandler}
					/>
				)}
				{activeStep == 1 && (
					<VerificationForm
						// TODO id то у меня нету
						instrumentId={instrument.id || ''}
						stepMonth={+(instrument.interVerificationInterval || 0)}
						defaultValues={verification}
						onSubmit={submitHandler(localKeys.verification)}
						submitLabel='Далее'
						cancelLabel='Назад'
						onCancel={cancelHandler}
					/>
				)}
				{activeStep == 2 && (
					<LocationForm
						defaultValues={location}
						disabled={creating}
						hidden={{ needConfirmed: true }}
						submitLabel='Сохранить'
						cancelLabel='Назад'
						onSubmit={submitHandler(localKeys.location)}
						onCancel={cancelHandler}
					/>
				)}
			</Stack>
		</Stack>
	)
}
