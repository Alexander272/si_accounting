import { FC } from 'react'
import {
	Button,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
} from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useGetDepartmentsByIdQuery } from '@/features/departments/departmentApiSlice'
import { Responsible } from '@/features/departments/components/Responsible'
import { Fallback } from '@/components/Fallback/Fallback'
import { Confirm } from '@/components/Confirm/Confirm'
import { EditIcon } from '@/components/Icons/EditIcon'
import { CloseIcon } from '@/components/Icons/CloseIcon'
import { useDeleteEmployeeMutation, useGetEmployeesQuery } from '../employeesApiSlice'
import { useAppDispatch } from '@/hooks/redux'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { EmployeeDialog } from './EmployeeDialog'

type Props = {
	department: string
}

export const EmployeeTable: FC<Props> = ({ department }) => {
	const { palette } = useTheme()
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetEmployeesQuery(department, { skip: !department || department == 'new' })
	const { data: dep, isFetching: depIsFetching } = useGetDepartmentsByIdQuery(department, {
		skip: !department || department == 'new',
	})

	const [remove] = useDeleteEmployeeMutation()

	const deleteHandler = async (id: string) => {
		console.log('delete', id)
		const employee = data?.data.find(e => e.id === id)
		if (!employee) return

		try {
			await remove(employee).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	const updateHandler = (id: string) => {
		console.log('update', id)
		dispatch(changeDialogIsOpen({ variant: 'Employee', isOpen: true, content: { id, department } }))
	}

	const addHandler = () => {
		console.log('add')
		dispatch(changeDialogIsOpen({ variant: 'Employee', isOpen: true, content: { department } }))
	}

	return (
		<Stack width={'100%'} alignItems={'center'}>
			<Responsible department={dep?.data} />
			{/* <ResponsibleEmployee employees={data?.data || []} department={dep?.data} /> */}

			{/* //TODO прописать sso_id всех пользователям */}

			{/* //TODO кнопка для добавления нового сотрудника и еще надо как-то редактировать уже созданных */}
			<TableContainer sx={{ position: 'relative', minHeight: 140, mt: 3, mb: 4 }}>
				{(isFetching || depIsFetching) && (
					<Fallback
						position={'absolute'}
						zIndex={5}
						background={'#f5f5f557'}
						alignItems={'flex-start'}
						pt={3}
					/>
				)}

				<EmployeeDialog />

				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell width={'40%'}>ФИО</TableCell>
							<TableCell width={'45%'}>Доп. информация</TableCell>
							<TableCell width={'15%'}>Действия</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data?.data.map(employee => (
							<TableRow key={employee.id}>
								<TableCell>{employee.name}</TableCell>
								<TableCell>{employee.notes}</TableCell>
								<TableCell>
									<Stack direction={'row'}>
										<Button onClick={() => updateHandler(employee.id)} sx={{ minWidth: 46 }}>
											<EditIcon fontSize={16} />
										</Button>

										<Confirm
											onClick={() => deleteHandler(employee.id)}
											width='46px'
											confirmText='Вы уверены, что хотите удалить сотрудника?'
											buttonComponent={
												<Button sx={{ minWidth: 46 }}>
													<CloseIcon fontSize={20} fill={palette.error.main} />
												</Button>
											}
										/>
									</Stack>
								</TableCell>
							</TableRow>
						))}

						<TableRow>
							<TableCell colSpan={3} align='center'>
								<Button
									onClick={addHandler}
									sx={{
										textTransform: 'inherit',
										width: 300,
										backgroundColor: '#9ab2ef29',
										':hover': { backgroundColor: '#9ab2ef52' },
									}}
								>
									Добавить
								</Button>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	)
}
