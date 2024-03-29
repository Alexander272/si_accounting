import { FC, PropsWithChildren, useEffect } from 'react'
import { Box, LinearProgress, Stack, TextField } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import { type InstrumentFormType, InstrumentFields } from '../fields'
import {
	useCreateInstrumentMutation,
	useGetInstrumentByIdQuery,
	useUpdateInstrumentMutation,
} from './instrumentApiSlice'
import type { IFetchError } from '@/app/types/error'

const defaultValues: InstrumentFormType = {
	name: '',
	type: '',
	factoryNumber: '',
	measurementLimits: '',
	accuracy: '',
	stateRegister: '',
	manufacturer: '',
	yearOfIssue: dayjs().get('year').toString(),
	interVerificationInterval: '12',
	notes: '',
}

type Props = {
	onSubmit: () => void
	instrumentId?: string
	draftId?: string
}

export const InstrumentForm: FC<PropsWithChildren<Props>> = ({
	children,
	onSubmit,
	instrumentId = 'draft',
	draftId,
}) => {
	const methods = useForm<InstrumentFormType>({ defaultValues })

	const { data, isFetching, isError } = useGetInstrumentByIdQuery(draftId || instrumentId)

	const [create] = useCreateInstrumentMutation()
	const [update] = useUpdateInstrumentMutation()

	useEffect(() => {
		if (data) methods.reset(data.data)
	}, [data, methods])
	useEffect(() => {
		if (isError) methods.reset(defaultValues)
	}, [isError, methods])

	const submitHandler = methods.handleSubmit(async data => {
		if (data.id == draftId) {
			data.id = undefined
		}

		try {
			if (!data.id) {
				await create(data).unwrap()
				// console.log('submit', data)
			} else if (Object.keys(methods.formState.dirtyFields).length) {
				await update(data).unwrap()
			}
			onSubmit()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	})

	const renderFields = () => {
		return InstrumentFields.map(f => {
			switch (f.type) {
				case 'number':
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<TextField label={f.label} type='number' error={Boolean(error)} {...field} />
							)}
						/>
					)
				default:
					return (
						<Controller
							key={f.key}
							control={methods.control}
							name={f.key}
							rules={f.rules}
							render={({ field, fieldState: { error } }) => (
								<TextField label={f.label} error={Boolean(error)} {...field} />
							)}
						/>
					)
			}
		})
	}

	return (
		<Stack component={'form'} onSubmit={submitHandler} paddingX={2} mt={2}>
			{isFetching && (
				<Box height={0}>
					<LinearProgress />
				</Box>
			)}

			<FormProvider {...methods}>
				<Stack spacing={2} mt={3}>
					{renderFields()}
				</Stack>
				<Stack direction={'row'} spacing={3} mt={4}>
					{children}
				</Stack>
			</FormProvider>
		</Stack>
	)
}
