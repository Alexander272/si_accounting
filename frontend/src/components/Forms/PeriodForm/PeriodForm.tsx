import { FC } from 'react'
import { Button, Stack } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

import type { IPeriodForm } from './type'
import { Titles } from './titles'

type Props = {
	onCancel: () => void
	onSubmit: (data: IPeriodForm, isShouldUpdate?: boolean) => void
}

const defaultValues: IPeriodForm = {
	gte: dayjs().startOf('D').startOf('M').unix(),
	lte: dayjs().add(1, 'M').startOf('D').startOf('M').unix(),
}

export const PeriodForm: FC<Props> = ({ onSubmit, onCancel }) => {
	const methods = useForm<IPeriodForm>({ values: defaultValues })

	const submitHandler = methods.handleSubmit(data => {
		onSubmit(data, Boolean(Object.keys(methods.formState.dirtyFields).length))
	})

	return (
		<Stack component={'form'} onSubmit={submitHandler} mt={2}>
			<FormProvider {...methods}>
				<Stack spacing={2}>
					<Controller
						control={methods.control}
						name={'gte'}
						rules={{ required: true }}
						render={({ field, fieldState: { error } }) => (
							<DatePicker
								{...field}
								value={dayjs(field.value * 1000)}
								onChange={value => field.onChange(value?.startOf('d').unix())}
								label={Titles.PeriodStart}
								showDaysOutsideCurrentMonth
								fixedWeekNumber={6}
								slotProps={{
									textField: {
										error: Boolean(error),
									},
								}}
							/>
						)}
					/>

					<Controller
						control={methods.control}
						name={'lte'}
						rules={{ required: true }}
						render={({ field, fieldState: { error } }) => (
							<DatePicker
								{...field}
								value={dayjs(field.value * 1000)}
								onChange={value => field.onChange(value?.startOf('d').unix())}
								label={Titles.PeriodEnd}
								showDaysOutsideCurrentMonth
								fixedWeekNumber={6}
								slotProps={{
									textField: {
										error: Boolean(error),
									},
								}}
							/>
						)}
					/>
				</Stack>
			</FormProvider>

			<Stack direction={'row'} spacing={3} mt={4}>
				<Button onClick={onCancel} variant='outlined' fullWidth>
					Отменить
				</Button>
				<Button variant='contained' type='submit' fullWidth>
					Применить
				</Button>
			</Stack>
		</Stack>
	)
}
