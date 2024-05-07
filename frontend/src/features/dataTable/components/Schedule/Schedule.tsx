import type { IPeriodForm } from '@/components/Forms/PeriodForm/type'
import { useModal } from '@/features/modal/hooks/useModal'
import { useLazyGetVerificationScheduleQuery } from '@/features/files/filesApiSlice'
import { PeriodForm } from '@/components/Forms/PeriodForm/PeriodForm'

export const Schedule = () => {
	const { closeModal } = useModal()

	const [getVerificationSchedule] = useLazyGetVerificationScheduleQuery()

	const submitHandler = async (period: IPeriodForm) => {
		await getVerificationSchedule(period)
		closeModal()
	}

	return (
		<>
			<PeriodForm onSubmit={submitHandler} onCancel={closeModal} />
		</>
	)
}
