import { Button, Stack, TextField, Typography, useTheme } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IDepartment, IDepartmentForm } from '../types/employee'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { Confirm } from '@/components/Confirm/Confirm'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import {
	useCreateDepartmentMutation,
	useDeleteDepartmentMutation,
	useUpdateDepartmentMutation,
} from '../employeesApiSlice'
import { getDepartment } from '../employeeSlice'

const defaultValues = {
	name: '',
}

export const DepartmentForm = () => {
	const department = useAppSelector(getDepartment)

	const { closeModal } = useModal()

	const { palette } = useTheme()

	const methods = useForm<IDepartmentForm>({
		defaultValues,
		values: department ? { name: department.name } : defaultValues,
	})

	const [create] = useCreateDepartmentMutation()
	const [update] = useUpdateDepartmentMutation()
	const [deleteDep] = useDeleteDepartmentMutation()

	const saveHandler = async (data: IDepartmentForm) => {
		const dep: IDepartment = {
			id: department?.id || '',
			name: data.name,
			leaderId: '',
		}

		try {
			if (department) await update(dep).unwrap()
			else await create(dep).unwrap()
			toast.success(`Успешно ${department ? 'обновлено' : 'создано'}`)
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			closeModal()
		}
	}

	const deleteHandler = async () => {
		if (!department) return

		try {
			await deleteDep(department.id).unwrap()
			toast.success(`Успешно удалено`)
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		} finally {
			closeModal()
		}
	}

	return (
		<Stack>
			<FormProvider {...methods}>
				<Stack spacing={2} mt={2}>
					<Controller
						control={methods.control}
						name='name'
						render={({ field }) => (
							<TextField
								name={field.name}
								label='Название'
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Stack>
			</FormProvider>

			<Stack direction='row' spacing={3} mt={4}>
				<Button onClick={methods.handleSubmit(saveHandler)} variant='contained' fullWidth>
					Сохранить
				</Button>
				{department && (
					<Confirm onClick={deleteHandler}>
						<Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'center'} mb={1}>
							<WarningIcon fill={palette.error.main} />
							<Typography fontSize={'1.1rem'} fontWeight='bold'>
								Удаление
							</Typography>
						</Stack>

						<Typography maxWidth={300} align='center'>
							Вы уверены, что хотите удалить подразделение? Все сотрудники данного подразделения также
							будут удалены.
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
