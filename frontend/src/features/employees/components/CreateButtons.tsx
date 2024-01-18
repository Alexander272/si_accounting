import { Box, Button } from '@mui/material'

import { useAppDispatch } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { setDepartment, setEmployee } from '../employeeSlice'

export const CreateButtons = () => {
	const { openModal } = useModal()

	const dispatch = useAppDispatch()

	const createDepartmentHandler = () => {
		dispatch(setDepartment())
		openModal('CreateDepartment')
	}

	const createEmployeeHandler = () => {
		dispatch(setEmployee())
		openModal('CreateEmployee')
	}

	return (
		<Box
			display='flex'
			gap={3}
			paddingX={3}
			paddingY={2}
			mb={2}
			mt={1}
			borderBottom={'1px solid rgba(0, 0, 0, 0.205)'}
		>
			<Box flexGrow={1} maxWidth={300}>
				<Button onClick={createDepartmentHandler} variant='contained' fullWidth>
					Добавить подразделение
				</Button>
			</Box>

			<Box flexGrow={1} maxWidth={300} marginX={'auto'}>
				<Button onClick={createEmployeeHandler} variant='outlined' fullWidth>
					Добавить сотрудника
				</Button>
			</Box>
		</Box>
	)
}
