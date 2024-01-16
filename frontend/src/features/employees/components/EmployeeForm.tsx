import { useEffect } from 'react'
import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import type { IEmployeeForm } from '../types/employee'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { getEmployee } from '../employeeSlice'

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

	const methods = useForm<IEmployeeForm>({ defaultValues })

	useEffect(() => {
		if (employee) {
			const parts = employee.name.split(' ')
			methods.setValue('lastName', parts[0])
			methods.setValue('firstName', parts[1])
			methods.setValue('surname', parts[2])
			methods.setValue('departmentId', employee.departmentId)
			methods.setValue('isLead', employee.isLead || false)
		}
	}, [employee, methods])

	return (
		<Stack component={'form'} paddingX={2} marginTop={2}>
			<FormProvider {...methods}>
				<Stack spacing={2} mt={3}>
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

					{/* //TODO решить что делать с этим select or autocomplete */}
					{/* department list */}

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
				</Stack>
			</FormProvider>

			<Stack direction='row' spacing={3} mt={4}>
				<Button variant='contained' fullWidth sx={{ borderRadius: 3 }}>
					Сохранить
				</Button>
				{employee && (
					<Button variant='contained' color='error' fullWidth sx={{ borderRadius: 3 }}>
						Удалить
					</Button>
				)}
				<Button onClick={closeModal} variant='outlined' fullWidth sx={{ borderRadius: 3 }}>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
