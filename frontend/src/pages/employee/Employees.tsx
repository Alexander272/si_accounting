import { useState } from 'react'
import { Box, Breadcrumbs, Stack } from '@mui/material'

import { PageBox } from '@/styled/PageBox'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { AppRoutes } from '@/constants/routes'
import { DepartmentList } from '@/features/departments/components/DepartmentList'
import { EmployeeTable } from '@/features/employees/components/EmployeeTable'
import { DepartmentForm } from '@/features/departments/components/DepartmentForm'

// страница для управления работниками и департаментами
export default function Employees() {
	const [department, setDepartment] = useState('new')

	const departmentHandler = (department: string) => {
		setDepartment(department)
	}

	return (
		<PageBox>
			<Box
				borderRadius={3}
				padding={2}
				margin={'0 auto'}
				width={'66%'}
				border={'1px solid rgba(0, 0, 0, 0.12)'}
				flexGrow={1}
				display={'flex'}
				flexDirection={'column'}
				sx={{ backgroundColor: '#fff', userSelect: 'none' }}
			>
				<Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
					<Breadcrumb to={AppRoutes.HOME}>Главная</Breadcrumb>
					<Breadcrumb to={AppRoutes.EMPLOYEES} active>
						Подразделения
					</Breadcrumb>
				</Breadcrumbs>

				<Stack direction={'row'} spacing={2}>
					<DepartmentList department={department} setDepartment={departmentHandler} />
					<Stack width={'100%'} spacing={3} sx={{ maxHeight: 760, overflowY: 'auto', pt: 1 }}>
						<DepartmentForm department={department} setDepartment={departmentHandler} />
						{department != 'new' && <EmployeeTable department={department} />}
					</Stack>
				</Stack>
			</Box>
		</PageBox>
	)
}
