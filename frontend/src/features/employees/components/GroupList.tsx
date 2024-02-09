import { MouseEvent } from 'react'
import { Box, Typography } from '@mui/material'

import { useAppDispatch } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { useGetDepartmentsQuery, useGetEmployeesQuery } from '../employeesApiSlice'
import { setDepartment, setEmployee } from '../employeeSlice'

export const GroupList = () => {
	const departments = useGetDepartmentsQuery(null)
	const employees = useGetEmployeesQuery(null)

	const { openModal } = useModal()

	const dispatch = useAppDispatch()

	const openEmployeeHandler = (event: MouseEvent<HTMLDivElement>) => {
		const { id, index } = (event.target as HTMLDivElement).dataset
		if (!id || !index || employees.data?.data[+index].id != id) return

		dispatch(setEmployee(employees.data?.data[+index]))
		openModal('EditEmployee')
	}

	const openDepartmentHandler = (event: MouseEvent<HTMLDivElement>) => {
		const { id, index } = (event.target as HTMLDivElement).dataset
		if (!id || !index || departments.data?.data[+index].id != id) return

		dispatch(setDepartment(departments.data.data[+index]))
		openModal('EditDepartment')
	}

	return (
		<Box>
			{(departments.data?.data || []).map((d, i) => (
				<Box
					key={d.id}
					borderBottom={'1px solid rgba(0, 0, 0, 0.205)'}
					display={'flex'}
					gap={3}
					paddingX={3}
					paddingY={1.2}
				>
					<Box flexGrow={1} maxWidth={300}>
						<Typography
							onClick={openDepartmentHandler}
							data-id={d.id}
							data-index={i}
							fontSize={'1.2rem'}
							sx={{
								cursor: 'pointer',
								paddingX: 2,
								paddingY: 1.2,
								borderRadius: 3,
								border: '1px solid #000000ba',
								transition: 'all 0.4s ease-in-out',
								':hover': {
									boxShadow: '2px 2px 4px 2px #00000038',
								},
							}}
						>
							{d.name}
						</Typography>
					</Box>

					<Box
						onClick={openEmployeeHandler}
						flexGrow={1}
						display={'grid'}
						alignItems={'center'}
						gridTemplateColumns={'repeat(3, 1fr)'}
						sx={{ rowGap: '12px', columnGap: '20px' }}
					>
						{employees.data?.data.map((e, i) => {
							if (e.departmentId == d.id)
								return (
									<Typography
										key={e.id}
										data-id={e.id}
										data-index={i}
										align='center'
										sx={{
											cursor: 'pointer',
											paddingX: 2,
											paddingY: 1.2,
											borderRadius: 3,
											background: '#f1f1f1',
											transition: 'all 0.4s ease-in-out',
											':hover': {
												boxShadow: '2px 2px 4px 2px #00000026',
											},
										}}
									>
										{e.name}
									</Typography>
								)
							else return null
						})}
					</Box>
				</Box>
			))}
		</Box>
	)
}
