import { FC } from 'react'
import { SvgIcon, SxProps, Theme } from '@mui/material'

export const VerifyIcon: FC<SxProps<Theme>> = style => {
	return (
		<SvgIcon sx={style}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 512 511.97'
			>
				<path
					fillRule='nonzero'
					d='m138.85 214.68 61.34-.82 4.57 1.19c21.52 12.41 40.78 27.9 57.46 46.31 22.01-35.41 45.45-67.92 70.22-97.82 27.13-32.77 55.92-62.49 86.16-89.62l5.99-2.3h66.93l-13.49 14.99c-41.48 46.09-79.11 93.72-113.11 142.84-34.02 49.17-64.43 99.92-91.47 152.16l-8.41 16.24-7.74-16.54c-28.23-60.59-68.03-112.19-123.45-150.24l5-16.39zM255.98 0c38.45 0 76.18 8.56 110.84 25.2 2.23 1.07 3.19 3.78 2.12 6.02-.31.64-.75 1.18-1.28 1.6l-37.54 30.72a4.565 4.565 0 0 1-4.67.72c-22.26-8.06-45.75-12.11-69.42-12.11-54.27 0-105.78 21.29-144.14 59.69-38.39 38.41-59.7 89.83-59.7 144.14 0 54.28 21.29 105.75 59.69 144.13 38.42 38.4 89.83 59.71 144.15 59.71 54.22 0 105.79-21.31 144.12-59.7 38.41-38.39 59.7-89.84 59.7-144.14 0-13.2-1.21-26.19-3.75-39.16-.27-1.41.15-2.82 1.03-3.83l33.11-41.96c1.56-1.94 4.42-2.23 6.36-.67.73.59 1.22 1.36 1.48 2.2 9.25 26.83 13.92 55.05 13.92 83.42 0 68.03-26.87 132.89-74.98 181-48.1 48.09-112.98 74.99-180.99 74.99-68.03 0-132.89-26.89-181-74.99l-.18-.2C26.81 388.67 0 323.97 0 255.98 0 187.96 26.87 123.1 74.98 74.99l.2-.18C123.29 26.81 188.02 0 255.98 0z'
				/>
			</svg>
		</SvgIcon>
	)
}
