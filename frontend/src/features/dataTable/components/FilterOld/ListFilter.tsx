import { FC, SyntheticEvent, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Stack, useTheme } from '@mui/material'
import { useFormContext } from 'react-hook-form'

import { ISIFilterOld } from '../../types/data'

type Props = {
	list: { id: string; name: string }[]
}

export const ListFilter: FC<Props> = ({ list }) => {
	const methods = useFormContext<ISIFilterOld>()

	const { palette } = useTheme()

	const values = methods.watch('valueStart')
	const [selected, setSelected] = useState<string[]>(values.length ? values.split(',') : [])

	useEffect(() => {
		const tmp = selected.join(',')
		if (tmp != values) {
			methods.setValue('valueStart', tmp)
			methods.setValue('compareType', 'in')
		}
	}, [selected, methods, values])

	const selectField = (id: string) => (_event: SyntheticEvent<Element, Event>, checked: boolean) => {
		let tmp = [...selected]
		if (checked) {
			tmp.push(id)
		} else {
			tmp = tmp.filter(s => s != id)
		}
		setSelected(tmp)
	}

	return (
		<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none', pr: 1 }}>
			{list.map(l => (
				<FormControlLabel
					key={l.id}
					label={l.name}
					control={<Checkbox checked={selected.includes(l.id)} />}
					onChange={selectField(l.id)}
					sx={{
						transition: 'all 0.3s ease-in-out',
						borderRadius: 3,
						':hover': { backgroundColor: palette.action.hover },
					}}
				/>
			))}
		</Stack>
	)
}
