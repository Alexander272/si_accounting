import { useEffect } from 'react'
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	TextField,
	Typography,
	useTheme,
} from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IEmployee, IEmployeeForm } from '../types/employee'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { getEmployee } from '../employeeSlice'
import {
	useCreateEmployeeMutation,
	useDeleteEmployeeMutation,
	useGetDepartmentsQuery,
	useUpdateEmployeeMutation,
} from '../employeesApiSlice'

const defaultValues: IEmployeeForm = {
	lastName: '',
	firstName: '',
	surname: '',
	departmentId: '',
	isLead: false,
}

export const EmployeeForm = () => {
	const employee = useAppSelector(getEmployee)

	const { closeModal } = useModal()

	const { palette } = useTheme()

	const methods = useForm<IEmployeeForm>({ defaultValues })

	const [create] = useCreateEmployeeMutation()
	const [update] = useUpdateEmployeeMutation()
	const [deleteEmp] = useDeleteEmployeeMutation()
	const departments = useGetDepartmentsQuery(null)

	useEffect(() => {
		if (employee) {
			const parts = employee.name.split(' ')
			const emp: IEmployeeForm = {
				lastName: parts[0],
				firstName: parts[1],
				surname: parts[2],
				departmentId: employee.departmentId,
				isLead: employee.isLead || false,
			}
			methods.reset(emp)
		}
	}, [employee, methods])

	const saveHandler = async (data: IEmployeeForm) => {
		const emp: IEmployee = {
			id: employee?.id || '',
			name: `${data.lastName} ${data.firstName} ${data.surname}`,
			departmentId: data.departmentId,
			isLead: data.isLead,
			mattermostId: '',
		}

		try {
			if (employee) await update(emp).unwrap()
			else await create(emp).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			closeModal()
		}
	}

	const deleteHandler = async () => {
		if (!employee) return

		try {
			await deleteEmp(employee).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			closeModal()
		}
	}

	return (
		<Stack component={'form'} paddingX={2}>
			<FormProvider {...methods}>
				<Stack spacing={2} mt={2}>
					<Controller
						control={methods.control}
						name='lastName'
						render={({ field }) => (
							<TextField
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								label='Фамилия'
							/>
						)}
					/>
					<Controller
						control={methods.control}
						name='firstName'
						render={({ field }) => (
							<TextField name={field.name} value={field.value} onChange={field.onChange} label='Имя' />
						)}
					/>
					<Controller
						control={methods.control}
						name='surname'
						render={({ field }) => (
							<TextField
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								label='Отчество'
							/>
						)}
					/>

					<Controller
						control={methods.control}
						name='departmentId'
						render={({ field }) => (
							<Autocomplete
								options={departments.data?.data || []}
								disablePortal
								value={departments.data?.data.find(d => d.id == field.value) || null}
								onChange={(_event, value) => field.onChange(value?.id || '')}
								getOptionLabel={option => option.name}
								renderInput={params => (
									<TextField {...params} name={field.name} label='Подразделение' />
								)}
							/>
						)}
					/>

					<Box>
						<Controller
							control={methods.control}
							name='isLead'
							render={({ field }) => (
								<FormControlLabel
									label='Ответственный за получение инструментов для подразделения'
									checked={field.value}
									onChange={field.onChange}
									control={<Checkbox name={field.name} />}
								/>
							)}
						/>
					</Box>
				</Stack>
			</FormProvider>

			<Stack direction='row' spacing={3} mt={4}>
				<Button onClick={methods.handleSubmit(saveHandler)} variant='contained' fullWidth>
					Сохранить
				</Button>
				{employee && (
					<Confirm onClick={deleteHandler}>
						<Stack spacing={1} direction={'row'} justifyContent={'center'} alignItems={'center'} mb={1}>
							<WarningIcon fill={palette.error.main} />
							<Typography fontSize={'1.1rem'} fontWeight={'bold'} align='center'>
								Удаление
							</Typography>
						</Stack>

						<Typography maxWidth={260} align='center'>
							Вы уверены, что хотите удалить сотрудника?
						</Typography>
					</Confirm>
				)}
				<Button onClick={closeModal} variant='outlined' fullWidth>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
