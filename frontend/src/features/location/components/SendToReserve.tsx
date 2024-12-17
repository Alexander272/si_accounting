import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { Location } from '../types/location'
import { ColumnNames } from '@/constants/columns'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getActiveItem, getSelected } from '@/features/dataTable/dataTableSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { useCreateSeveralLocationMutation } from '../locationApiSlice'

export const SendToReserve = () => {
	const active = useAppSelector(getActiveItem)

	const selected = useAppSelector(getSelected)

	const { closeModal } = useModal()

	const [create, { isLoading }] = useCreateSeveralLocationMutation()

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

		if (active?.id && active.status == 'used' && !selected[active.id]) {
			locations.push({
				instrumentId: active.id,
				...location,
			})
		}
		Object.values(selected).forEach(i => {
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

	const items = Object.values(selected).filter(i => i.status == 'used')
	if (!items.some(i => i.id == active?.id) && active) items.push(active)

	return (
		<Stack position={'relative'}>
			{isLoading && (
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
					{items.map(r => (
						<TableRow key={r.id}>
							<TableCell>{r.name}</TableCell>
							<TableCell>{r.factoryNumber}</TableCell>
							<TableCell>{r.place}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Stack direction={'row'} spacing={3} mt={4}>
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отменить
				</Button>
				<Button onClick={saveHandler} variant='contained' fullWidth>
					Сохранить
				</Button>
			</Stack>
		</Stack>
	)
}
