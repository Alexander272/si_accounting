import { Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import type { IDepartmentForm } from '../types/employee'
// import { useAppSelector } from '@/hooks/redux'
// import { getDepartment } from '../employeeSlice'

const defaultValues = {
	name: '',
}

export const DepartmentForm = () => {
	// const department = useAppSelector(getDepartment)

	const methods = useForm<IDepartmentForm>({ defaultValues })

	return (
		<Stack>
			<FormProvider {...methods}>
				<Stack spacing={2} mt={3}></Stack>
			</FormProvider>

			<Stack direction='row'></Stack>
		</Stack>
	)
}
