import { FC, useState } from 'react'
import { Button, Stack, Tooltip, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { DraftKey } from '@/constants/localKeys'
import { useModal } from '@/features/modal/hooks/useModal'
import { useDeleteInstrumentMutation, useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { useGetLastVerificationQuery } from '@/features/verification/verificationApiSlice'
import { useSaveSIMutation } from '@/features/dataTable/siApiSlice'
import { getActiveItem, setActive } from '@/features/dataTable/dataTableSlice'
import { CreateInstrumentForm } from '@/features/instrument/components/CreateInstrumentForm'
import { UpdateInstrumentForm } from '@/features/instrument/components/UpdateInstrumentForm'
import { CreateVerificationForm } from '@/features/verification/components/CreateVerificationForm'
import { UpdateVerificationForm } from '@/features/verification/components/UpdateVerificationForm'
import { CreateLocationForm } from '@/features/location/components/CreateLocationForm'
import { FileDeleteIcon } from '@/components/Icons/FileDeleteIcon'
import { Stepper } from '@/components/Stepper/Stepper'
import { Fallback } from '@/components/Fallback/Fallback'

const steps = [
	{ id: 'instrument', label: 'Информация о СИ' },
	{ id: 'verification', label: 'Поверка СИ' },
	{ id: 'place', label: 'Место нахождения СИ' },
]

export const CreateSi = () => {
	const [activeStep, setActiveStep] = useState(0)

	const { closeModal } = useModal()

	const { palette } = useTheme()

	const dispatch = useAppDispatch()

	const { data } = useGetInstrumentByIdQuery(DraftKey)
	const [deleteDraft] = useDeleteInstrumentMutation()
	const [save] = useSaveSIMutation()

	const deleteHandler = async () => {
		if (!data?.data) return

		try {
			await deleteDraft(data?.data).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	const changeStepHandler = async (isNext: boolean = true) => {
		if (activeStep == 0 && !isNext) {
			closeModal()
			return
		}

		if (isNext) {
			if (activeStep + 1 == steps.length) {
				await save(data?.data.id || '').unwrap()
				dispatch(setActive())
			}
			setActiveStep(prev => (prev + 1) % steps.length)
		} else setActiveStep(prev => prev - 1)
	}

	return (
		<Stack>
			<Stack direction={'row'} width={'100%'} alignItems={'center'} mb={1.5}>
				<Stepper steps={steps} active={activeStep} sx={{ width: '100%' }} />

				<Tooltip title='Удалить черновик'>
					<span>
						<Button variant='outlined' color='error' onClick={deleteHandler} disabled={!data?.data}>
							<FileDeleteIcon
								fill={!data?.data ? palette.action.disabled : palette.error.main}
								fontSize={22}
							/>
						</Button>
					</span>
				</Tooltip>
			</Stack>

			{activeStep == 0 && <InstrumentForm changeStep={changeStepHandler} />}
			{activeStep == 1 && <VerificationForm changeStep={changeStepHandler} />}
			{activeStep == 2 && <LocationForm changeStep={changeStepHandler} />}
		</Stack>
	)
}

type FormProps = {
	changeStep: (isNext?: boolean) => void
}

const InstrumentForm: FC<FormProps> = ({ changeStep }) => {
	const active = useAppSelector(getActiveItem)

	const { data, isLoading } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })
	const { data: draft, isLoading: isLoadDraft, isError } = useGetInstrumentByIdQuery(DraftKey)

	const submitHandler = () => changeStep()
	const cancelHandler = () => changeStep(false)

	let instrument = isError ? undefined : draft?.data
	if (data?.data) instrument = { ...data.data, id: draft?.data.id, status: draft?.data.status || DraftKey }

	if (data?.data && data?.data.id != draft?.data.id) {
		instrument!.id = undefined
	}

	if (isLoading || isLoadDraft) return <Fallback marginTop={5} marginBottom={3} />

	if (instrument?.id) {
		return (
			<UpdateInstrumentForm
				data={instrument}
				submitLabel='Далее'
				onSubmit={submitHandler}
				onCancel={cancelHandler}
			/>
		)
	}
	return (
		<CreateInstrumentForm data={instrument} submitLabel='Далее' onSubmit={submitHandler} onCancel={cancelHandler} />
	)
}

const VerificationForm: FC<FormProps> = ({ changeStep }) => {
	const { data: instrument, isLoading: isLoadingInstrument } = useGetInstrumentByIdQuery(DraftKey)
	const { data, isLoading } = useGetLastVerificationQuery(instrument?.data.id || '', { skip: !instrument?.data.id })

	const submitHandler = () => changeStep()
	const cancelHandler = () => changeStep(false)

	if (!instrument || isLoading || isLoadingInstrument) return <Fallback marginTop={5} marginBottom={3} height={450} />

	if (data?.data?.id)
		return (
			<UpdateVerificationForm
				instrument={instrument?.data}
				data={data.data}
				submitLabel='Далее'
				cancelLabel='Назад'
				onSubmit={submitHandler}
				onCancel={cancelHandler}
			/>
		)

	return (
		<CreateVerificationForm
			instrument={instrument?.data}
			submitLabel='Далее'
			cancelLabel='Назад'
			onSubmit={submitHandler}
			onCancel={cancelHandler}
		/>
	)
}

const LocationForm: FC<FormProps> = ({ changeStep }) => {
	const { data: instrument, isLoading } = useGetInstrumentByIdQuery('draft')

	const submitHandler = () => changeStep()
	const cancelHandler = () => changeStep(false)

	if (!instrument || isLoading) return <Fallback marginTop={5} marginBottom={3} height={450} />

	return (
		<CreateLocationForm
			instrument={instrument?.data}
			hidden={{ needConfirmed: true }}
			submitLabel='Сохранить'
			cancelLabel='Назад'
			onSubmit={submitHandler}
			onCancel={cancelHandler}
		/>
	)
}
