import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { Location } from '../types/location'
import { ColumnNames } from '@/constants/columns'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { useGetAllSIQuery } from '@/features/dataTable/siApiSlice'
import { getActiveItem, getSelectedItems, getTableFilter, getTableSort } from '@/features/dataTable/dataTableSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { useCreateSeveralLocationMutation } from '../locationApiSlice'

export const SendToReserve = () => {
	const active = useAppSelector(getActiveItem)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selectedItems = useAppSelector(getSelectedItems)

	const { closeModal } = useModal()

	const { data, isFetching } = useGetAllSIQuery({ page: 0, size: 9999999, sort, filter })
	const [create] = useCreateSeveralLocationMutation()

	const saveHandler = async () => {
		const date = dayjs().startOf('d').unix()
		const locations: Location[] = []

		const location = {
			department: '',
			person: '',
			dateOfIssue: date,
			dateOfReceiving: 0,
			needConfirmed: true,
			status: 'moved',
		}

		if (active?.id && active.status == 'used' && !selectedItems.some(s => s.id == active.id)) {
			locations.push({
				instrumentId: active.id,
				...location,
			})
		}
		selectedItems.forEach(i => {
			locations.push({
				instrumentId: i.id,
				...location,
			})
		})

		try {
			if (!locations.length) return
			const payload = await create(locations).unwrap()
			toast.success(payload.message)
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	const items = selectedItems.filter(i => i.status == 'used')

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

			<Table>
				<TableHead>
					<TableRow>
						<TableCell>{ColumnNames.NAME}</TableCell>
						<TableCell>{ColumnNames.FACTORY_NUMBER}</TableCell>
						<TableCell>{ColumnNames.PLACE}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data?.data.map(r => {
						if (items.some(i => i.id == r.id) || (active?.id == r.id && active.status == 'used')) {
							return (
								<TableRow key={r.id}>
									<TableCell>{r.name}</TableCell>
									<TableCell>{r.factoryNumber}</TableCell>
									<TableCell>{r.place}</TableCell>
								</TableRow>
							)
						}
					})}
				</TableBody>
			</Table>

			<Stack direction={'row'} spacing={3} mt={4}>
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отменить
				</Button>
				<Button onClick={saveHandler} variant='contained' fullWidth>
					Сохранить
				</Button>
				{/* <Confirm
					onClick={deleteHandler}
					fullWidth
					buttonComponent={
						<Button variant='contained' fullWidth>
							Да
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
						Вы уверены, что хотите удалить перемещение?
					</Typography>
				</Confirm> */}
			</Stack>
		</Stack>
	)
}
