import { FC } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import dayjs, { type Dayjs } from 'dayjs'

import type { IVerificationForm } from './type'
import { Upload } from '@/features/files/components/Upload/Upload'
import { VerificationStatuses } from '@/constants/verification'
import { Titles } from './titles'

type Props = {
	instrumentId: string
	verificationId: string
	stepMonth: number
	disabled?: boolean
}

export const VerificationInputs: FC<Props> = ({ instrumentId, verificationId, stepMonth, disabled }) => {
	const { control, watch, setValue } = useFormContext<IVerificationForm>()

	const status = watch('status')

	const applyStep = (date: Dayjs) => {
		const next = date.add(stepMonth, 'M').subtract(1, 'd')
		setValue('nextDate', next.startOf('d').unix())
	}

	return (
		<Stack spacing={2}>
			<Controller
				control={control}
				name={'date'}
				rules={{ required: true, min: 1000000000 }}
				render={({ field, fieldState: { error } }) => (
					<DatePicker
						{...field}
						value={dayjs(field.value * 1000)}
						onChange={value => {
							field.onChange(value?.startOf('d').unix())
							value && applyStep(value)
						}}
						label={Titles.VerificationDate}
						showDaysOutsideCurrentMonth
						fixedWeekNumber={6}
						disabled={disabled}
						slotProps={{
							textField: {
								error: Boolean(error),
							},
						}}
					/>
				)}
			/>
			{status == 'work' && (
				<Controller
					control={control}
					name={'nextDate'}
					rules={{ required: true, min: 1000000000 }}
					render={({ field, fieldState: { error } }) => (
						<DatePicker
							{...field}
							value={dayjs(field.value * 1000)}
							onChange={value => field.onChange(value?.startOf('d').unix())}
							label={Titles.NextVerificationDate}
							showDaysOutsideCurrentMonth
							fixedWeekNumber={6}
							disabled={disabled}
							slotProps={{
								textField: {
									error: Boolean(error),
								},
							}}
						/>
					)}
				/>
			)}
			<Controller
				control={control}
				name={'status'}
				render={({ field, fieldState: { error } }) => (
					<FormControl>
						<InputLabel id={'status'}>{Titles.Status}</InputLabel>

						<Select labelId={'status'} label={Titles.Status} error={Boolean(error)} {...field}>
							<MenuItem value={VerificationStatuses.Work}>Пригоден</MenuItem>
							<MenuItem value={VerificationStatuses.Repair}>Нужен ремонт</MenuItem>
							<MenuItem value={VerificationStatuses.Decommissioning}>Не пригоден</MenuItem>
						</Select>
					</FormControl>
				)}
			/>
			<Controller
				control={control}
				name='registerLink'
				render={({ field }) => <TextField {...field} type='link' label={Titles.Link} disabled={disabled} />}
			/>
			<Controller
				control={control}
				name='notes'
				render={({ field }) => (
					<TextField {...field} label={Titles.Notes} multiline minRows={4} disabled={disabled} />
				)}
			/>

			<Upload instrumentId={instrumentId} verificationId={verificationId} />
		</Stack>
	)
}
