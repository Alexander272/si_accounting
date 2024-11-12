import { FC, useEffect, useState } from 'react'
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	SelectChangeEvent,
	Stack,
	Theme,
	Typography,
	useTheme,
} from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IDataItem, ISIFilter } from '@/features/dataTable/types/data'
import { useAppSelector } from '@/hooks/redux'
import { PermRules } from '@/constants/permissions'
import { useGetMovedSIQuery } from '@/features/dataTable/siApiSlice'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { useGetDepartmentsQuery } from '@/features/employees/employeesApiSlice'
import { useGetResponsibleByUserQuery } from '@/features/departments/responsibleApiSlice'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { CheckboxGroup } from '@/components/CheckboxGroup/CheckboxGroup'
import { Fallback } from '@/components/Fallback/Fallback'
import { useReceivingMutation } from '../locationApiSlice'

export const ReceivingForm = () => {
	const active = useAppSelector(getActiveItem)

	//TODO при закрытии формы вылазит весь список
	if (!active) return <ReceivingList />
	return <ReceivingOne id={active.id} />
}

type ReceivingProps = {
	id: string
}
const ReceivingOne: FC<ReceivingProps> = ({ id }) => {
	const hasResWrite = useCheckPermission(PermRules.Reserve.Write)
	const { closeModal } = useModal()

	const { data, isFetching } = useGetInstrumentByIdQuery(id || '', { skip: !id })
	const [receiving] = useReceivingMutation()

	const receiveHandler = async () => {
		const payload = {
			instrumentId: [id],
			status: hasResWrite ? 'used' : 'reserve',
		}
		console.log(payload)

		try {
			await receiving(payload).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	if (isFetching) return <Fallback />
	return (
		<Stack spacing={2} alignItems={'center'}>
			<Typography width={'100%'}>
				Подтвердите получение инструмента «{data?.data.name}» ({data?.data.factoryNumber})
			</Typography>

			<Button onClick={receiveHandler} variant='outlined' sx={{ width: 300 }}>
				Подтвердить
			</Button>
		</Stack>
	)
}

const defFilter: ISIFilter[] = [
	{
		field: 'place',
		values: [{ compareType: 'null', value: '' }],
	},
]

const ReceivingList = () => {
	const theme = useTheme()
	const hasResWrite = useCheckPermission(PermRules.Reserve.Write)

	const [enable, setEnable] = useState<string[]>([])
	const [filter, setFilter] = useState(defFilter)
	const { data: departments, isFetching: isFetchDepartments } = useGetDepartmentsQuery(null)
	// const { data: departmentsByUser } = useGetDepartmentsByUserQuery(null)
	const { data: departmentsByUser } = useGetResponsibleByUserQuery(null)

	const { data, isFetching } = useGetMovedSIQuery({ filter })
	// console.log(data)

	useEffect(() => {
		if (departmentsByUser) setEnable(departmentsByUser.data.map(d => d.departmentId))
	}, [departmentsByUser])
	useEffect(() => {
		if (hasResWrite) {
			setFilter([{ ...defFilter[0], values: [{ compareType: 'in', value: enable.join(',') }] }])
		}
	}, [hasResWrite, enable])

	const handleChange = (event: SelectChangeEvent<typeof enable>) => {
		const { value } = event.target
		setEnable(typeof value === 'string' ? value.split(',') : value)
		const newFilter = {
			...defFilter[0],
			values: [{ compareType: 'in' as const, value: typeof value === 'string' ? value : value.join(',') }],
		}
		setFilter([newFilter])
	}

	return (
		<Stack spacing={1} mt={1} alignItems={'center'}>
			{hasResWrite ? (
				<>
					<FormControl sx={{ m: 1, width: '100%' }}>
						<InputLabel id='departments'>Подразделение</InputLabel>
						<Select
							labelId='departments'
							multiple
							value={enable}
							onChange={handleChange}
							input={<OutlinedInput label='Подразделение' />}
							// MenuProps={MenuProps}
						>
							{departments?.data.map(d => (
								<MenuItem key={d.id} value={d.id} style={getStyles(d.id, enable, theme)}>
									{d.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</>
			) : null}

			{isFetchDepartments || isFetching ? <Fallback /> : <GroupedList data={data?.data || []} />}
		</Stack>
	)
}

type GroupedListProps = {
	data: IDataItem[]
}
const GroupedList: FC<GroupedListProps> = ({ data }) => {
	const defState = data.reduce((a, v) => a.set(v.id, true), new Map<string, boolean>())
	const [checked, setChecked] = useState<Map<string, boolean>>(defState)
	const hasResWrite = useCheckPermission(PermRules.Reserve.Write)
	const { closeModal } = useModal()

	const [receiving] = useReceivingMutation()

	const groupMap = new Map<string, IDataItem[]>()
	data.forEach(d => {
		d = { ...d, name: `${d.name} (${d.factoryNumber})` }

		if (groupMap.has(d.place || d.lastPlace)) {
			groupMap.get(d.place || d.lastPlace)?.push(d)
		} else {
			groupMap.set(d.place || d.lastPlace, [d])
		}
	})

	const receiveHandler = async () => {
		const value: string[] = []
		checked.forEach((v, k) => {
			if (v && data.some(d => d.id === k)) value.push(k)
		})

		const payload = {
			instrumentId: value,
			status: hasResWrite ? 'used' : 'reserve',
		}
		console.log(payload)

		try {
			await receiving(payload).unwrap()
			closeModal()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
			console.log(error)
		}
	}

	if (!groupMap.size) return <Typography>Инструменты для получения не найдены</Typography>
	return (
		<>
			<Stack width={'100%'}>
				{[...groupMap.keys()].map(key => (
					<CheckboxGroup
						key={key}
						checked={checked}
						data={{ name: key, list: groupMap.get(key) || [] }}
						onChange={setChecked}
					/>
				))}
			</Stack>

			<Button onClick={receiveHandler} variant='outlined' sx={{ width: 300 }}>
				Получить
			</Button>
		</>
	)
}

function getStyles(name: string, array: string[], theme: Theme) {
	return {
		fontWeight: array.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
	}
}
