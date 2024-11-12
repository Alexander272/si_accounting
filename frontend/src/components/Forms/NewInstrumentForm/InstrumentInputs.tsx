import { FC } from 'react'
import { Checkbox, FormControlLabel, Stack, TextField, useTheme } from '@mui/material'
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form'

import type { Field } from '../type'
import type { IInstrumentForm, KeysOfInstrument } from './type'
import { ColumnNames } from '@/constants/columns'

const fields: Field<KeysOfInstrument>[] = [
	{ key: 'name', type: 'String', label: ColumnNames.NAME, rules: { required: true } },
	{ key: 'type', type: 'String', label: ColumnNames.TYPE },
	{ key: 'factoryNumber', type: 'String', label: ColumnNames.FACTORY_NUMBER },
	{ key: 'measurementLimits', type: 'String', label: ColumnNames.MEASUREMENT_LIMITS },
	{ key: 'accuracy', type: 'String', label: ColumnNames.ACCURACY },
	{ key: 'stateRegister', type: 'String', label: ColumnNames.STATE_REGISTER },
	{ key: 'manufacturer', type: 'String', label: ColumnNames.MANUFACTURER },
	{ key: 'yearOfIssue', type: 'Number', label: ColumnNames.YEAR_OF_ISSUE, rules: { required: true, min: 1900 } },
	// {
	// 	key: 'interVerificationInterval',
	// 	type: 'Number',
	// 	label: ColumnNames.INTER_VERIFICATION_INTERVAL,
	// 	rules: { required: true, min: 1 },
	// },
	// { key: 'notes', type: 'String', label: ColumnNames.NOTES, multiline: true, minRows: 3 },
]
const VerificationField = { key: 'notVerified' as const, type: '', label: 'Не поверяется' }
const IntervalField = {
	key: 'interVerificationInterval' as const,
	type: 'Number',
	label: ColumnNames.INTER_VERIFICATION_INTERVAL,
	rules: { required: true, min: 1 },
}
const NotesField = { key: 'notes' as const, type: 'String', label: ColumnNames.NOTES, multiline: true, minRows: 3 }

type Props = {
	disabled?: boolean
}

export const InstrumentInputs: FC<Props> = ({ disabled }) => {
	const { control, watch } = useFormContext<IInstrumentForm>()
	const { palette } = useTheme()

	const notVerified = watch(VerificationField.key)

	return (
		<Stack spacing={2}>
			{fields.map(f =>
				f.type == 'String' ? (
					<Controller
						key={f.key}
						control={control}
						name={f.key}
						rules={f.rules as RegisterOptions<IInstrumentForm, KeysOfInstrument>}
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								label={f.label}
								multiline={f.multiline}
								minRows={f.minRows}
								disabled={disabled}
								error={Boolean(error)}
							/>
						)}
					/>
				) : (
					<Controller
						key={f.key}
						control={control}
						name={f.key}
						rules={f.rules as RegisterOptions<IInstrumentForm, KeysOfInstrument>}
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								label={f.label}
								type='number'
								disabled={disabled}
								error={Boolean(error)}
							/>
						)}
					/>
				)
			)}

			<Controller
				control={control}
				name={VerificationField.key}
				render={({ field }) => (
					<FormControlLabel
						label={VerificationField.label}
						control={<Checkbox checked={field.value || false} />}
						onChange={field.onChange}
						sx={{
							transition: 'all 0.3s ease-in-out',
							borderRadius: 3,
							userSelect: 'none',
							':hover': { backgroundColor: palette.action.hover },
						}}
					/>
				)}
			/>
			{!notVerified && (
				<Controller
					key={IntervalField.key}
					control={control}
					name={IntervalField.key}
					rules={IntervalField.rules as RegisterOptions<IInstrumentForm, 'interVerificationInterval'>}
					render={({ field, fieldState: { error } }) => (
						<TextField {...field} label={IntervalField.label} disabled={disabled} error={Boolean(error)} />
					)}
				/>
			)}

			<Controller
				key={NotesField.key}
				control={control}
				name={NotesField.key}
				render={({ field, fieldState: { error } }) => (
					<TextField
						{...field}
						label={NotesField.label}
						multiline={NotesField.multiline}
						minRows={NotesField.minRows}
						disabled={disabled}
						error={Boolean(error)}
					/>
				)}
			/>
		</Stack>
	)
}
