import { ChangeEvent, FC } from 'react'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { toast } from 'react-toastify'

import { UploadIcon } from '../Icons/UploadIcon'
import { QuestionIcon } from '../Icons/QuestionIcon'
import { AcceptedFiles } from '@/constants/accept'
import Input from './styled/Input'
import Button from './styled/Button'

type Props = {
	//TODO а нужно ли мне это тут
	onChange?: () => void
}

export const Upload: FC<Props> = () => {
	const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (!files) return
		const acceptedFiles: File[] = []

		for (let i = 0; i < files.length; i++) {
			const file = files[i]

			if (!(file.type in AcceptedFiles)) {
				toast.error(`Файл ${file.name} имеет неразрешенный тип`)
				continue
			}
			acceptedFiles.push(file)
		}
	}

	return (
		<Stack direction={'row'} spacing={3} alignItems={'flex-start'}>
			<Button component='label'>
				<UploadIcon />
				<Typography ml={1}>Загрузить файлы</Typography>

				<Input onChange={changeHandler} type='file' multiple />
			</Button>

			<Stack
				flexGrow={1}
				width={'100%'}
				border={'1px dashed #c4c4c4'}
				borderRadius={3}
				paddingY={0.75}
				paddingX={2}
				minHeight={38}
				position={'relative'}
			>
				<Tooltip
					title='Допустимые форматы: .doc, .docx, .odt, .xls, .xlsx, .pdf, .png, .jpeg, .jpg, .csv'
					arrow
				>
					<Box position={'absolute'} right={8} top={8}>
						<QuestionIcon fontSize={16} color='#828282' />
					</Box>
				</Tooltip>

				{/* <Typography color={'#828282'}>
					Допустимые форматы: .doc, .docx, .xls, .xlsx, .pdf, .png, .jpeg, .jpg, .csv
				</Typography> */}
			</Stack>
		</Stack>
	)
}
