import { IDocument } from '@/features/files/types/file'

export interface IVerification {
	id?: string
	instrumentId: string
	date: number
	nextDate: number
	// date: string
	// nextDate: string
	// fileLink: string
	registerLink: string
	status: string
	notVerified: boolean
	notes: string
	// files?: File[]
	documents?: IDocument[]
	isDraftInstrument?: boolean
}
