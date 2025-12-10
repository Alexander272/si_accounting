import { FC } from 'react'
import { Autocomplete, Button, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IEmployee } from '../types/employee'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { Dialog } from '@/features/dialog/components/Dialog'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { useCreateEmployeeMutation, useGetEmployeeByIdQuery, useUpdateEmployeeMutation } from '../employeesApiSlice'
import { useGetDepartmentsQuery } from '@/features/departments/departmentApiSlice'

type Context = { id?: string; department?: string }

export const EmployeeDialog = () => {
	const modal = useAppSelector(getDialogState('Employee'))

	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Employee', isOpen: false }))
	}

	return (
		<Dialog
			title={(modal?.content as Context)?.id ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
			body={<Form {...(modal?.content as Context)} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='sm'
			fullWidth
		/>
	)
}

const defaultValues = {
	id: '',
	name: '',
	departmentId: '',
	notes: '',
}
export const Form: FC<Context> = ({ id, department }) => {
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetEmployeeByIdQuery(id || '', { skip: !id })
	const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery(null)
	const [create, { isLoading: isCreating }] = useCreateEmployeeMutation()
	const [update, { isLoading: isUpdating }] = useUpdateEmployeeMutation()

	const { control, handleSubmit } = useForm<IEmployee>({
		values: data?.data || { ...defaultValues, departmentId: department || '' },
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Employee', isOpen: false }))
	}

	const saveHandler = handleSubmit(async form => {
		console.log('save', form)

		const newData = {
			...data?.data,
			id: data?.data.id || id || '',
			name: form.name.trim(),
			notes: form.notes.trim(),
			departmentId: form.departmentId,
		}

		try {
			if (id) await update(newData).unwrap()
			else await create(newData).unwrap()
			closeHandler()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	})

	return (
		<Stack component={'form'} paddingX={2} position={'relative'} spacing={2} onSubmit={saveHandler}>
			{isFetching || departmentsIsFetching || isCreating || isUpdating ? (
				<Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} />
			) : null}

			<Controller
				control={control}
				name='departmentId'
				rules={{ required: true }}
				render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
					<Autocomplete
						value={departments?.data.find(d => d.id == value) || ''}
						onChange={(_e, value) => onChange(typeof value == 'string' ? value : value.id)}
						freeSolo
						disableClearable
						autoComplete
						options={departments?.data || []}
						getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
						loading={departmentsIsFetching}
						loadingText='Поиск похожих значений...'
						noOptionsText='Ничего не найдено'
						renderInput={params => (
							<TextField
								{...params}
								label={'Подразделение'}
								onChange={onChange}
								error={Boolean(error)}
								helperText={error?.message}
								inputRef={ref}
								multiline
							/>
						)}
					/>
				)}
			/>

			<Controller
				control={control}
				name='name'
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<TextField {...field} label='ФИО' error={Boolean(error)} />
				)}
			/>
			<Controller
				control={control}
				name='notes'
				render={({ field, fieldState: { error } }) => (
					<TextField {...field} label='Доп. информация' error={Boolean(error)} />
				)}
			/>

			<Stack spacing={2} direction={'row'}>
				<Button type='submit' variant='contained' fullWidth>
					Сохранить
				</Button>
				<Button onClick={closeHandler} variant='outlined' fullWidth>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
