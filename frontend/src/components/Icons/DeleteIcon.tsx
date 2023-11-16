import { SvgIcon } from '@mui/material'
import { FC } from 'react'

type Props = {
	fontSize?: number | string
	color?: string
	pointerEvents?: 'none'
}

export const DeleteIcon: FC<Props> = ({ fontSize, color, pointerEvents }) => {
	return (
		<SvgIcon sx={{ fontSize, fill: color, pointerEvents }}>
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 110.61 122.88'>
				<path d='M39.27 58.64a4.74 4.74 0 1 1 9.47 0v35.08a4.74 4.74 0 1 1-9.47 0V58.64zm63.6-19.86L98 103a22.29 22.29 0 0 1-6.33 14.1 19.41 19.41 0 0 1-13.88 5.78h-45a19.4 19.4 0 0 1-13.86-5.78 22.31 22.31 0 0 1-6.34-14.1L7.74 38.78H0V25c0-3.32 1.63-4.58 4.84-4.58h22.74v-9.63A10.82 10.82 0 0 1 38.37 0h33.87A10.82 10.82 0 0 1 83 10.79v9.62h23.35a6.19 6.19 0 0 1 1 .06 3.86 3.86 0 0 1 3.24 3.53V38.78zm-9.5.17H17.24L22 102.3a12.82 12.82 0 0 0 3.57 8.1 10 10 0 0 0 7.19 3h45a10.06 10.06 0 0 0 7.19-3 12.8 12.8 0 0 0 3.59-8.1L93.37 39zM71 20.41v-8.36H39.64v8.36zm-9.13 38.23a4.74 4.74 0 1 1 9.47 0v35.08a4.74 4.74 0 1 1-9.47 0V58.64z' />
			</svg>
		</SvgIcon>
	)
}
