import { FC } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { getActiveItem } from '@/features/dataTable/dataTableSlice'
import { useGetLastVerificationQuery } from '@/features/verification/verificationApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { Upload } from '../Upload/Upload'

type Props = unknown

export const DocumentsForm: FC<Props> = () => {
	const active = useAppSelector(getActiveItem)
	const { data, isFetching } = useGetLastVerificationQuery(active?.id || '', { skip: !active?.id })

	if (isFetching) return <Fallback marginTop={5} marginBottom={3} height={250} />
	if (!active || !data) return
	return <Upload instrumentId={active.id} verificationId={data?.data.id || ''} />
}
