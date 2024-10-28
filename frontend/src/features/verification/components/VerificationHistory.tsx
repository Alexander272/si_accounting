import {
	Chip,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import dayjs from 'dayjs'

import type { IDocument } from '../../files/types/file'
import { useAppSelector } from '@/hooks/redux'
import { DayjsFormat } from '@/constants/dateFormat'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { DocIcon } from '@/components/Icons/DocIcon'
import { PdfIcon } from '@/components/Icons/PdfIcon'
import { ImageIcon } from '@/components/Icons/ImageIcon'
import { SheetIcon } from '@/components/Icons/SheetIcon'
import { getActiveItem } from '../../dataTable/dataTableSlice'
import { useLazyDownloadFileQuery } from '../../files/filesApiSlice'
import { useGetVerificationByInstrumentIdQuery } from '../verificationApiSlice'

const FileTypes = {
	doc: <DocIcon ml={0.8} />,
	pdf: <PdfIcon ml={0.8} />,
	image: <ImageIcon ml={0.8} />,
	sheet: <SheetIcon ml={0.8} />,
}

const Statuses = {
	work: 'Пригоден',
	repair: 'Нужен ремонт',
	decommissioning: 'Не пригоден',
}

export const VerificationHistory = () => {
	const active = useAppSelector(getActiveItem)

	const { data: instrument } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })
	const { data } = useGetVerificationByInstrumentIdQuery(active?.id || '', { skip: !active?.id })

	const [download] = useLazyDownloadFileQuery()

	const downloadHandler = (doc: IDocument) => async () => {
		await download(doc)
	}

	return (
		<TableContainer>
			<Typography fontSize={'1.2rem'} textAlign={'center'}>
				{instrument?.data.name} ({instrument?.data.factoryNumber})
			</Typography>

			<Table>
				<TableHead>
					<TableRow>
						<TableCell width={'14%'} align='center'>
							Дата поверки
							<br />
							(калибровки)
						</TableCell>
						<TableCell width={'14%'} align='center'>
							Дата след. поверки
							<br />
							(калибровки)
						</TableCell>
						<TableCell width={'14%'} align='center'>
							Ссылка на
							<br />
							поверку
						</TableCell>
						<TableCell width={'10%'} align='center'>
							Результат
						</TableCell>
						<TableCell width={'20%'} align='center'>
							Файлы
						</TableCell>
						<TableCell width={'28%'} align='center'>
							Примечание
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data?.data.map(d => (
						<TableRow key={d.id}>
							<TableCell align='center'>
								{d.date ? dayjs(d.date * 1000).format(DayjsFormat) : '-'}
							</TableCell>
							<TableCell align='center'>
								{d.date ? dayjs(d.nextDate * 1000).format(DayjsFormat) : '-'}
							</TableCell>
							<TableCell align='center'>{d.registerLink}</TableCell>
							<TableCell align='center'>{Statuses[d.status as 'work']}</TableCell>
							<TableCell>
								<Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
									{d.documents?.map(d => (
										<Chip
											key={d.id}
											icon={FileTypes[d.type as 'doc']}
											label={d.label}
											onClick={downloadHandler(d)}
											variant='outlined'
											clickable
											sx={{ height: 42 }}
										/>
									))}
								</Stack>
							</TableCell>
							<TableCell>{d.notes}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
