import { FC, useEffect } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form'

import { useGetEmployeesQuery } from '@/features/employees/employeesApiSlice'

type Props = {
	label: string
	name: string
	rules?: RegisterOptions
	disabled?: boolean
}

export const EmployeeList: FC<Props> = ({ label, name, rules, disabled }) => {
	const { control, watch, setValue } = useFormContext()

	const departmentId = watch('department')
	const { data, isFetching } = useGetEmployeesQuery(departmentId || null)

	useEffect(() => {
		if (data?.data.length) setValue('person', data.data[0].id)
	}, [data, setValue])

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
					noOptionsText='Ничего не найдено'
					loadingText='Загрузка...'
					disabled={disabled}
					renderInput={params => (
						<TextField {...params} label={label} autoComplete='off' error={Boolean(error)} />
					)}
				/>
			)}
		/>
	)
}
