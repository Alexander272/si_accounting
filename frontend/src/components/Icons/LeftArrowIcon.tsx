import { FC } from 'react'
import { SvgIcon, SxProps, Theme } from '@mui/material'

export const LeftArrowIcon: FC<SxProps<Theme>> = style => {
	return (
		<SvgIcon sx={style}>
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 66.91 122.88' xmlSpace='preserve'>
				<path d='M64.96 111.2a6.884 6.884 0 0 1-.13 9.73 6.875 6.875 0 0 1-9.73-.14L1.97 66.01l4.93-4.8-4.95 4.8a6.902 6.902 0 0 1 .15-9.76c.08-.08.16-.15.24-.22L55.1 2.09c2.65-2.73 7-2.79 9.73-.14 2.73 2.65 2.78 7.01.13 9.73L16.5 61.23l48.46 49.97z' />
			</svg>
		</SvgIcon>
	)
}
