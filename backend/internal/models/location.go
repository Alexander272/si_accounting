package models

type Location struct {
	Id           string `json:"id" db:"id"`
	InstrumentId string `json:"instrumentId" db:"instrument_id"`
	Person       string `json:"person" db:"person"`
	Department   string `json:"department" db:"department"`
	ReceiptDate  string `json:"receiptDate" db:"receipt_date"`
	DeliveryDate string `json:"deliveryDate" db:"delivery_date"`
	Status       string `json:"status" db:"status"`
}

type CreateLocationDTO struct {
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	Person       string `json:"person" db:"person" binding:"required"`
	Department   string `json:"department" db:"department" binding:"required"`
	ReceiptDate  string `json:"receiptDate" db:"receipt_date"`
	DeliveryDate string `json:"deliveryDate" db:"delivery_date"`
	Status       string `json:"status" db:"status"`
}

type UpdateLocationDTO struct {
	Id           string `json:"id" db:"id" binding:"required"`
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	Person       string `json:"person" db:"person" binding:"required"`
	Department   string `json:"department" db:"department" binding:"required"`
	ReceiptDate  string `json:"receiptDate" db:"receipt_date"`
	DeliveryDate string `json:"deliveryDate" db:"delivery_date"`
	Status       string `json:"status" db:"status"`
}
