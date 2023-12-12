import { FC, SyntheticEvent, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Stack, useTheme } from '@mui/material'
import { useFormContext } from 'react-hook-form'

import { ISIFilter } from '../../types/data'

type Props = {
	list: { id: string; name: string }[]
}

export const ListFilter: FC<Props> = ({ list }) => {
	const methods = useFormContext<ISIFilter>()

	const { palette } = useTheme()

	const values = methods.watch('valueStart')
	const [selected, setSelected] = useState<string[]>(values.length ? values.split(',') : [])

	useEffect(() => {
		const tmp = selected.join(',')
		if (tmp != values) methods.setValue('valueStart', tmp)
	}, [selected, methods, values])

	const selectField = (label: string) => (_event: SyntheticEvent<Element, Event>, checked: boolean) => {
		let tmp = [...selected]
		if (checked) {
			tmp.push(label)
		} else {
			tmp = tmp.filter(s => s != label)
		}
		setSelected(tmp)
	}

	return (
		<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none', pr: 1 }}>
			{list.map(l => (
				<FormControlLabel
					key={l.id}
					label={l.name}
					control={<Checkbox checked={selected.includes(l.name)} />}
					onChange={selectField(l.name)}
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
