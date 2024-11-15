import { FC } from 'react'
import { FormControlLabel, IconButton, InputAdornment, Stack, Switch, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import type { IColumn } from '@/features/dataTable/types/data'
import { WidthIcon } from '@/components/Icons/WidthIcon'
import { DragIcon } from '@/components/Icons/DragIcon'

type Props = {
	index: number
	label: string
}

export const Column: FC<Props> = ({ index, label }) => {
	const { control } = useFormContext<{ data: IColumn[] }>()

	return (
		<Stack direction={'row'} alignItems={'center'} mb={1}>
			<IconButton sx={{ cursor: 'grab', mr: 1 }} className='drag'>
				<DragIcon fill={'#a8a8a8'} fontSize={24} />
			</IconButton>

			{/* <Stack height={'fit-content'} mr={1} mt={'7px'}>
				<IconButton
					onClick={() => onMove(index, index - 1)}
					disabled={index === 0}
					sx={{ width: 24, height: 24, mt: -1, ':hover': { backgroundColor: '#0000001c' } }}
				>
					<LeftArrowIcon fontSize={14} transform={'rotate(90deg)'} fill={index == 0 ? '#a3a3a3' : ''} />
				</IconButton>

				<IconButton
					onClick={() => onMove(index, index + 1)}
					disabled={index === total}
					sx={{ width: 24, height: 24, mt: -1, ':hover': { backgroundColor: '#0000001c' } }}
				>
					<LeftArrowIcon fontSize={14} transform={'rotate(-90deg)'} fill={index == total ? '#a3a3a3' : ''} />
				</IconButton>
			</Stack> */}

			<Controller
				control={control}
				name={`data.${index}.hidden`}
				render={({ field }) => (
					<FormControlLabel
						label={label}
						sx={{
							color: !field.value ? 'inherit' : '#505050',
							transition: '.2s color ease-in-out',
							userSelect: 'none',
						}}
						control={
							<Switch checked={!field.value} onChange={event => field.onChange(!event.target.checked)} />
						}
					/>
				)}
			/>
			<Controller
				control={control}
				name={`data.${index}.width`}
				rules={{
					min: 50,
					max: 800,
					pattern: {
						value: /^(0|[1-9]\d*)(\.\d+)?$/,
						message: '',
					},
				}}
				render={({ field, fieldState: { error } }) => (
					<TextField
						{...field}
						error={Boolean(error)}
						helperText={error ? '50 ≤ Размер ≤ 800' : ''}
						// type='number'
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<WidthIcon fontSize={18} />
								</InputAdornment>
							),
						}}
						sx={{
							width: 120,
							minWidth: 120,
							ml: 'auto',
							'.MuiFormHelperText-root': { mx: 0.8 },
						}}
					/>
				)}
			/>
		</Stack>
	)
}
