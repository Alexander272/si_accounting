import { Button, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { ILocationForm } from '@/components/Forms/NewLocationForm/type'
import type { Location } from '../types/location'
import { ColumnNames } from '@/constants/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getSelectedItems, removeSelected } from '@/features/dataTable/dataTableSlice'
import { useGetInstrumentsQuery } from '@/features/instrument/instrumentApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { LocationInputs } from '@/components/Forms/NewLocationForm/LocationInputs'
import { useCreateSeveralLocationMutation } from '../locationApiSlice'

const defaultValues: ILocationForm = {
	needConfirmed: false,
	isToReserve: false,
	department: '',
	person: '',
	dateOfIssue: dayjs().startOf('d').unix(),
}
export const CreateSeveralLocation = () => {
	const selectedItems = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { closeModal } = useModal()
	const methods = useForm<ILocationForm>({ values: defaultValues })

	const { data, isFetching } = useGetInstrumentsQuery(selectedItems.map(i => i.id).join(','), {
		skip: !selectedItems.length,
	})
	const [create] = useCreateSeveralLocationMutation()

	const items = selectedItems.filter(i => i.status != 'moved')
	const used = items.filter(i => i.status != 'reserve')
	const reserve = items.filter(i => i.status != 'used')

	const submitHandler = methods.handleSubmit(async data => {
		console.log(data)
		const locations: Location[] = []

		reserve.forEach(i => {
			locations.push({
				...data,
				instrumentId: i.id,
				status: !data.needConfirmed ? 'used' : 'moved',
				dateOfReceiving: !data.needConfirmed ? data.dateOfIssue : 0,
			})
		})
		used.forEach(i => {
			locations.push({
				instrumentId: i.id,
				department: '',
				person: '',
				needConfirmed: false,
				status: 'reserve',
				dateOfIssue: dayjs().startOf('d').unix(),
				dateOfReceiving: dayjs().startOf('d').unix(),
			})
		})

		try {
			if (!locations.length) return
			const payload = await create(locations).unwrap()
			toast.success(payload.message)
			closeModal()
			dispatch(removeSelected(undefined))
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	})

	// TODO это перестало работать
	return (
		<Stack position={'relative'}>
			{isFetching && (
				<Fallback
					position={'absolute'}
					top={'50%'}
					left={'50%'}
					transform={'translate(-50%, -50%)'}
					height={160}
					width={160}
					borderRadius={3}
					zIndex={15}
					backgroundColor={'#fafafa'}
				/>
			)}

			<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
				Передать инструмент сотруднику
			</Typography>

			<FormProvider {...methods}>
				<LocationInputs hidden={{ isToReserve: true }} />
			</FormProvider>

			{reserve.length > 0 && (
				<>
					<Table sx={{ mt: 2 }}>
						<TableHead>
							<TableRow>
								<TableCell width={'70%'}>{ColumnNames.NAME}</TableCell>
								<TableCell>{ColumnNames.FACTORY_NUMBER}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.data.map(r => {
								if (reserve.some(i => i.id == r.id)) {
									return (
										<TableRow key={r.id}>
											<TableCell>{r.name}</TableCell>
											<TableCell>{r.factoryNumber}</TableCell>
											{/* <TableCell>{r.status}</TableCell> */}
										</TableRow>
									)
								}
							})}
						</TableBody>
					</Table>
					<Divider sx={{ m: 3 }} />
				</>
			)}

			{used.length > 0 && (
				<>
					<Typography fontSize={'1.2rem'} fontWeight={'bold'} textAlign={'center'}>
						Переместить следующий инструмент в резерв
					</Typography>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell width={'70%'}>{ColumnNames.NAME}</TableCell>
								<TableCell>{ColumnNames.FACTORY_NUMBER}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.data.map(r => {
								if (used.some(i => i.id == r.id)) {
									return (
										<TableRow key={r.id}>
											<TableCell>{r.name}</TableCell>
											<TableCell>{r.factoryNumber}</TableCell>
											{/* <TableCell>{r.status}</TableCell> */}
										</TableRow>
									)
								}
							})}
						</TableBody>
					</Table>
					<Divider sx={{ m: 3 }} />
				</>
			)}

			<Button onClick={submitHandler} variant={'outlined'} sx={{ width: 400, mx: 'auto' }}>
				Переместить
			</Button>
		</Stack>
	)
}
