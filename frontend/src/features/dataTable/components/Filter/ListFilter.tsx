import { FC } from 'react'
import { Button, Checkbox, FormControlLabel, Stack, useTheme } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import type { IDataItem, ISIFilter } from '../../types/data'

type ListFilter = {
	[x: string]: boolean
}

type Props = {
	field: keyof IDataItem
	list: { id: string; name: string }[]
	values?: string[]
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const ListFilter: FC<Props> = ({ field, list, values, onCancel, onSubmit }) => {
	const defaultValues = list.reduce((a, v) => ({ ...a, [v.id]: false }), {})
	Object.assign(
		defaultValues,
		values?.reduce((a, v) => ({ ...a, [v]: true }), {})
	)

	const methods = useForm<ListFilter>({ values: defaultValues })

	const { palette } = useTheme()

	const submitHandler = methods.handleSubmit(data => {
		const value = Object.keys(data).reduce((ac: string[], k) => {
			if (data[k]) ac.push(k)
			return ac
		}, [])

		if (value.length == 0) {
			onCancel()
			return
		}

		const filter: ISIFilter = {
			field: field,
			fieldType: 'list',
			values: [
				{
					compareType: 'in',
					value: value.join(','),
				},
			],
		}

		onSubmit(filter)
	})

	return (
		<FormProvider {...methods}>
			<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none', pr: 1 }}>
				{list.map(l => (
					<Controller
						key={l.id}
						control={methods.control}
						name={l.id}
						render={({ field }) => (
							<FormControlLabel
								label={l.name}
								control={<Checkbox checked={field.value} />}
								onChange={field.onChange}
								sx={{
									transition: 'all 0.3s ease-in-out',
									borderRadius: 3,
									':hover': { backgroundColor: palette.action.hover },
								}}
							/>
						)}
					/>
				))}
			</Stack>

			<Stack direction={'row'} mt={3} spacing={2}>
				<Button onClick={onCancel} fullWidth>
					Отменить
				</Button>

				<Button onClick={submitHandler} fullWidth variant='outlined'>
					Применить
				</Button>
			</Stack>
		</FormProvider>
	)
}
