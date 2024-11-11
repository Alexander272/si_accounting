import { FC, useEffect, useState } from 'react'
import { Button, MenuItem, Select, SelectChangeEvent, Stack, Typography, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IEmployee } from '@/features/employees/types/employee'
import type { IDepartment } from '../types/departments'
import { useUpdateDepartmentMutation } from '../departmentApiSlice'
import { SaveIcon } from '@/components/Icons/SaveIcon'

type Props = {
	// lead?: IEmployee
	employees: IEmployee[]
	department?: IDepartment
}

export const ResponsibleEmployee: FC<Props> = ({ employees, department }) => {
	const { palette } = useTheme()
	const [lead, setLead] = useState('empty')

	const [update] = useUpdateDepartmentMutation()

	useEffect(() => {
		setLead(employees.find(e => e.id == department?.leaderId)?.id || 'empty')
	}, [department, employees])

	const chooseLeadHandler = (event: SelectChangeEvent) => {
		setLead(event.target.value)
	}

	const saveHandler = async () => {
		if (!department) return
		try {
			await update({ ...department, leaderId: lead }).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	// TODO надо бы еще наверное автоматически соединять ответственного сотрудника с keycloak. только хз как это сделать
	// можно тут смотреть есть ли sso_id, если нет показывать кнопочку для получения id (при нажатии на нее делать запрос в keycloak и пытаться найти данного сотрудника) или делать запрос при выборе, а если не получилось уже показывать кнопочку
	//Если не найден, то показывать сообщение типа "Сотрудник не найден, попробуйте указать ФИО полностью и попробуйте еще раз, если проблема сохраняется обратитесь к администратору системы"

	// ФИО сотрудника, Название канала, иконка что есть связь с keycloak
	return (
		<Stack width={'98%'} direction={'row'} spacing={1} alignItems={'center'}>
			<Typography>Ответственный сотрудник:</Typography>

			{/* //TODO надо бы сделать так чтобы можно было выбрать нескольких сотрудников */}
			<Select value={lead} onChange={chooseLeadHandler} sx={{ width: 500 }}>
				<MenuItem value='empty'>Не выбран</MenuItem>
				{employees.map(e => (
					<MenuItem key={e.id} value={e.id}>
						{e.name} {e.notes ? `(${e.notes})` : ''}
					</MenuItem>
				))}
			</Select>
			{/* //TODO возможно стоить добавить возможность указать пользователя не из этого подразделения */}
			{/* //TODO добавить подсказку для чего это поле */}

			<Button
				onClick={saveHandler}
				variant='outlined'
				type='submit'
				disabled={lead == department?.leaderId}
				sx={{
					minWidth: 56,
					height: '100%',
				}}
			>
				<SaveIcon
					fontSize={18}
					fill={lead == department?.leaderId ? palette.action.disabled : palette.primary.main}
				/>
			</Button>
		</Stack>
	)
}
