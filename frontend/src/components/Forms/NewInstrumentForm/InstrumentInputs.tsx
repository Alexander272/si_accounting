import { FC } from 'react'
import { Stack, TextField } from '@mui/material'
import { useFormContext } from 'react-hook-form'

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
	{ key: 'yearOfIssue', type: 'Number', label: ColumnNames.YEAR_OF_ISSUE, rules: { required: true } },
	{
		key: 'interVerificationInterval',
		type: 'Number',
		label: ColumnNames.INTER_VERIFICATION_INTERVAL,
		rules: { required: true, min: 1 },
	},
	{ key: 'notes', type: 'String', label: ColumnNames.NOTES, multiline: true, minRows: 3 },
]

type Props = {
	disabled?: boolean
}

export const InstrumentInputs: FC<Props> = ({ disabled }) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<IInstrumentForm>()

	return (
		<Stack spacing={2}>
			{fields.map(f =>
				f.type == 'String' ? (
					<TextField
						key={f.key}
						label={f.label}
						multiline={f.multiline}
						minRows={f.minRows}
						disabled={disabled}
						error={Boolean(errors[f.key])}
						{...register(f.key)}
					/>
				) : (
					<TextField
						key={f.key}
						label={f.label}
						type='number'
						disabled={disabled}
						error={Boolean(errors[f.key])}
						{...register(f.key)}
					/>
				)
			)}
		</Stack>
	)
}
