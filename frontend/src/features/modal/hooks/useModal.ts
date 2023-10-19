import { useAppDispatch } from '@/hooks/redux'
import { ModalSelectors, changeModalIsOpen, setModalSelector } from '../modalSlice'

/**
 * @returns объект из двух функций, открытия и закрытия модального окна
 */
export const useModal = () => {
	const dispatch = useAppDispatch()

	/**
	 * @param selector вариант модального окна, который следует открыть
	 */
	const openModal = (selector: ModalSelectors) => {
		dispatch(setModalSelector(selector))
		dispatch(changeModalIsOpen(true))
	}

	const closeModal = () => {
		dispatch(changeModalIsOpen(false))
	}

	return { openModal, closeModal }
}
