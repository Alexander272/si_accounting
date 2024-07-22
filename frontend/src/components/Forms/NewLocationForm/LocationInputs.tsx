import { FC } from 'react'
import { Checkbox, FormControlLabel, Stack } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

// import type { Field } from '../type'
import type { ILocationForm, HiddenField } from './type'
import { DepartmentList } from '../DepartmentList'
import { EmployeeList } from '../EmployeeList'
import { Titles } from './titles'

// const fields: Field<KeysOfLocation>[] = [
// 	{ key: 'needConfirmed', label: 'Нужны уведомления', type: 'Bool' },
// 	{ key: 'department', label: 'Подразделение', type: 'List', rules: { required: true } },
// 	{ key: 'person', label: 'Лицо держащее СИ', type: 'List', rules: { required: true } },
// 	{ key: 'dateOfIssue', label: 'дата выдачи или поступления', type: 'Date', rules: { required: true } },
// ]

type Props = {
	hidden?: HiddenField
	disabled?: boolean
}

export const LocationInputs: FC<Props> = ({ hidden, disabled }) => {
	const { control } = useFormContext<ILocationForm>()

	return (
		<Stack spacing={2} alignItems={'flex-start'}>
			{!(hidden && hidden['isToReserve']) ? (
				<Controller
					name='isToReserve'
					control={control}
					render={({ field }) => (
						<FormControlLabel
							control={<Checkbox checked={field.value} />}
							label={Titles.Reserve}
							onChange={field.onChange}
							disabled={disabled}
						/>
					)}
				/>
			) : null}
			{!(hidden && hidden['needConfirmed']) ? (
				<Controller
					name='needConfirmed'
					control={control}
					render={({ field }) => (
						<FormControlLabel
							control={<Checkbox checked={field.value} />}
							label={Titles.Confirmed}
							onChange={field.onChange}
							disabled={disabled}
						/>
					)}
				/>
			) : null}
			{!(hidden && hidden['department']) ? (
				<DepartmentList
					label={Titles.Department}
					name='department'
					rules={{ required: true }}
					disabled={disabled}
				/>
			) : null}
			{!(hidden && hidden['person']) ? (
				<EmployeeList label={Titles.Employee} name='person' rules={{ required: true }} disabled={disabled} />
			) : null}
			{!(hidden && hidden['dateOfIssue']) ? (
				<Controller
					control={control}
					name={'dateOfIssue'}
					rules={{ required: true, min: 1000000000 }}
					render={({ field, fieldState: { error } }) => (
						<DatePicker
							{...field}
							value={dayjs(field.value * 1000)}
							onChange={value => field.onChange(value?.startOf('d').unix())}
							label={Titles.DateOfIssue}
							disabled={disabled}
							showDaysOutsideCurrentMonth
							fixedWeekNumber={6}
							disableFuture
							slotProps={{
								textField: {
									error: Boolean(error),
									fullWidth: true,
								},
							}}
						/>
					)}
				/>
			) : null}
		</Stack>
	)
}
