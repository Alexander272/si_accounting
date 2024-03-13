package models

import (
	"mime/multipart"
)

type Document struct {
	Id             string `json:"id" db:"id"`
	Label          string `json:"label" db:"label"`
	Size           int64  `json:"size" db:"size"`
	Path           string `json:"path" db:"path"`
	DocumentType   string `json:"type" db:"type"`
	VerificationId string `json:"verificationId" db:"verification_id"`
	InstrumentId   string `json:"-" db:"instrument_id"`
}

type GetDocumentsDTO struct {
	VerificationId string
	InstrumentId   string
}

type DocumentsDTO struct {
	VerificationId string
	InstrumentId   string
	Files          []*multipart.FileHeader
}

type PathParts struct {
	VerificationId string
	InstrumentId   string
}

type DeleteDocumentsDTO struct {
	Id             string
	InstrumentId   string
	VerificationId string
	Filename       string
}

type UpdateCount struct {
	VerificationId string `db:"verification_id"`
}
