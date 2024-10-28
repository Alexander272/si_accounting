import { FC } from 'react'
import { Button, Checkbox, Divider, FormControlLabel, InputAdornment, Stack, TextField, useTheme } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import type { IDataItem, ISIFilter } from '../../types/data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetDepartmentsQuery } from '@/features/employees/employeesApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { SearchIcon } from '@/components/Icons/SearchIcon'
import { ListFilter } from './ListFilter'

export type PlaceFilter = {
	search: string
	list: ListFilter
}

type Props = {
	field: keyof IDataItem
	values?: string[]
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const PlaceFilter: FC<unknown> = props => {
	const { field, values, onCancel, onSubmit } = props as Props
	const { palette } = useTheme()

	const { data, isFetching } = useGetDepartmentsQuery(null)

	const list = data?.data.reduce((a, v) => ({ ...a, [v.id]: false }), { _moved: false, _reserve: false })
	Object.assign(
		list || {},
		values?.reduce((a, v) => ({ ...a, [v]: true }), {})
	)

	const { control, watch, handleSubmit } = useForm<PlaceFilter>({
		values: { search: '', list: list || {} },
	})
	const search = watch('search')
	const debouncedSearch = useDebounce(search, 600) as string

	const submitHandler = handleSubmit(form => {
		const value = Object.keys(form.list).reduce((ac: string[], k) => {
			if (form.list[k]) ac.push(k)
			return ac
		}, [])
		if (value.length == 0) {
			onCancel()
			return
		}

		// const values = data?.data.reduce((a, v) => {
		// 	if (form.list[v.id]) a.push(v.name)
		// 	return a
		// }, [] as string[])
		// if (form.list._moved) values?.push('_moved')
		// if (form.list._reserve) values?.push('_reserve')
		// console.log(values)
		// if (!values || values?.length == 0) {
		// 	onCancel()
		// 	return
		// }

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

	if (isFetching) return <Fallback />
	return (
		<Stack spacing={2}>
			<Controller
				name='search'
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						// value={field.value || ''}
						name='search'
						placeholder='Поиск'
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon fontSize={16} />
								</InputAdornment>
							),
						}}
					/>
				)}
			/>

			<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none', pr: 1 }}>
				<Controller
					control={control}
					name={`list._reserve`}
					render={({ field }) => (
						<FormControlLabel
							label={'Резерв'}
							control={<Checkbox checked={field.value || false} />}
							onChange={field.onChange}
							sx={{
								transition: 'all 0.3s ease-in-out',
								borderRadius: 3,
								':hover': { backgroundColor: palette.action.hover },
							}}
						/>
					)}
				/>
				<Controller
					control={control}
					name={`list._moved`}
					render={({ field }) => (
						<FormControlLabel
							label={'Перемещение'}
							control={<Checkbox checked={field.value || false} />}
							onChange={field.onChange}
							sx={{
								transition: 'all 0.3s ease-in-out',
								borderRadius: 3,
								':hover': { backgroundColor: palette.action.hover },
							}}
						/>
					)}
				/>
				<Divider flexItem />

				{data?.data
					.filter(l => l.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
					.map(l => (
						<Controller
							key={l.id}
							control={control}
							name={`list.${l.id}`}
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
		</Stack>
	)
}
