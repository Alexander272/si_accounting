import { FC, useEffect } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form'

import type { ILocationForm } from './NewLocationForm/type'
import { useGetDepartmentsQuery } from '@/features/employees/employeesApiSlice'

type Props = {
	label: string
	name: 'department'
	rules?: RegisterOptions<ILocationForm, 'department'>
	disabled?: boolean
}

export const DepartmentList: FC<Props> = ({ label, name, rules, disabled }) => {
	const { control, setValue } = useFormContext<ILocationForm>()

	const { data, isFetching } = useGetDepartmentsQuery(null)

	useEffect(() => {
		//TODO на проде почему-то не отрабатывает setValue
		if (data?.data.length) setValue(name, data.data[0].id)
	}, [name, data, setValue])

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			disabled={disabled}
			render={({ field, fieldState: { error } }) => (
				<Autocomplete
					value={data?.data.find(d => d.id == field.value) || ''}
					onChange={(_event, value) => {
						field.onChange(typeof value == 'string' ? value : value.id)
					}}
					options={data?.data || []}
					loading={isFetching}
					getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
					freeSolo
					disableClearable
					loadingText='Загрузка...'
					noOptionsText='Ничего не найдено'
					disabled={disabled}
					fullWidth
					renderInput={params => (
						<TextField {...params} label={label} autoComplete='off' error={Boolean(error)} />
					)}
				/>
			)}
		/>
	)
}
