import { FC } from 'react'
import { Button, Checkbox, FormControlLabel, InputAdornment, Stack, TextField, useTheme } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import type { IDataItem, ISIFilter } from '../../types/data'
import type { ListFilter } from './ListFilter'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetUniqueEmployeeQuery } from '@/features/employees/employeesApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { SearchIcon } from '@/components/Icons/SearchIcon'
import { FixedSizeList } from 'react-window'

type Props = {
	field: keyof IDataItem
	values?: string[]
	onCancel: () => void
	onSubmit: (data: ISIFilter) => void
}

export const PersonFilter: FC<Props> = props => {
	const { field, values, onCancel, onSubmit } = props as Props
	const { palette } = useTheme()

	const { data, isFetching } = useGetUniqueEmployeeQuery(null)

	const list = data?.data?.reduce((a, v) => ({ ...a, [v.name.replaceAll('.', '_')]: false }), {})
	Object.assign(
		list || {},
		values?.reduce((a, v) => ({ ...a, [v.replaceAll('.', '_')]: true }), {})
	)

	const { control, watch, handleSubmit } = useForm<{ search: string; list: ListFilter }>({
		values: { search: '', list: list || {} },
	})
	const search = watch('search')
	const debouncedSearch = useDebounce(search, 600) as string

	const submitHandler = handleSubmit(data => {
		const value = Object.keys(data.list).reduce((ac: string[], k) => {
			// if (k.toLocaleLowerCase().includes(debouncedSearch.toLowerCase()) && data.list[k])
			if (data.list[k]) ac.push(k.replaceAll('_', '.'))
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

	const items = data?.data?.filter(l => l.name.toLowerCase().includes(debouncedSearch.toLowerCase())) || []

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

			<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none' }}>
				{/* {data?.data.map(l => ( */}
				<FixedSizeList
					overscanCount={12}
					height={300}
					itemCount={items.length}
					itemSize={42}
					itemData={items}
					width={368}
				>
					{({ index, style }) => (
						<Controller
							key={items[index].name}
							control={control}
							name={`list.${items[index].name.replaceAll('.', '_')}`}
							render={({ field }) => (
								<FormControlLabel
									label={items[index].name}
									control={<Checkbox checked={field.value || false} />}
									onChange={field.onChange}
									style={style}
									sx={{
										transition: 'all 0.3s ease-in-out',
										borderRadius: 3,
										':hover': { backgroundColor: palette.action.hover },
									}}
								/>
							)}
						/>
					)}
				</FixedSizeList>
				{/* {items.map(l => (
					<Controller
						key={l.name}
						control={control}
						name={`list.${l.name.replaceAll('.', '_')}`}
						render={({ field }) => (
							<FormControlLabel
								label={l.name}
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
				))} */}
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

export default PersonFilter
