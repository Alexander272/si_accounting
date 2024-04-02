import { FC, useEffect } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form'

import { useGetDepartmentsQuery } from '@/features/employees/employeesApiSlice'

type Props = {
	label: string
	name: string
	rules?: RegisterOptions
	disabled?: boolean
}

export const DepartmentList: FC<Props> = ({ label, name, rules, disabled }) => {
	const { control, setValue } = useFormContext()

	const { data, isFetching } = useGetDepartmentsQuery(null)

	useEffect(() => {
		if (data?.data.length) setValue('department', data.data[0].id)
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
					loadingText='Загрузка...'
					noOptionsText='Ничего не найдено'
					disabled={disabled}
					renderInput={params => (
						<TextField {...params} label={label} autoComplete='off' error={Boolean(error)} />
					)}
				/>
			)}
		/>
	)
}
