package models

type Location struct {
	Id           string `json:"id" db:"id"`
	InstrumentId string `json:"instrumentId" db:"instrument_id"`
	Person       string `json:"person" db:"person"`
	Department   string `json:"department" db:"department"`
	PersonId     string `json:"personId" db:"person_id"`
	DepartmentId string `json:"departmentId" db:"department_id"`
	// ReceiptDate     string `json:"receiptDate" db:"receipt_date"`
	// DeliveryDate    string `json:"deliveryDate" db:"delivery_date"`
	DateOfIssue     string `json:"dateOfIssue" db:"date_of_issue"`
	DateOfReceiving string `json:"dateOfReceiving" db:"date_of_receiving"`
	NeedConfirmed   bool   `json:"needConfirmed" db:"need_confirmed"`
	Status          string `json:"status" db:"status"`
}

type CreateLocationDTO struct {
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	// Person       string `json:"person" db:"person"`
	// Department   string `json:"department" db:"department"`
	PersonId     string `json:"person" db:"person_id"`
	DepartmentId string `json:"department" db:"department_id"`
	// ReceiptDate     string `json:"receiptDate" db:"receipt_date"`
	// DeliveryDate    string `json:"deliveryDate" db:"delivery_date"`
	DateOfIssue     string `json:"dateOfIssue" db:"date_of_issue"`
	DateOfReceiving string `json:"dateOfReceiving" db:"date_of_receiving"`
	NeedConfirmed   bool   `json:"needConfirmed" db:"need_confirmed"`
	Status          string `json:"status" db:"status"`
}

type UpdateLocationDTO struct {
	Id           string `json:"id" db:"id" binding:"required"`
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	// Person       string `json:"person" db:"person" binding:"required"`
	// Department   string `json:"department" db:"department" binding:"required"`
	PersonId     string `json:"person" db:"person_id"`
	DepartmentId string `json:"department" db:"department_id"`
	// ReceiptDate     string `json:"receiptDate" db:"receipt_date"`
	// DeliveryDate    string `json:"deliveryDate" db:"delivery_date"`
	DateOfIssue     string `json:"dateOfIssue" db:"date_of_issue"`
	DateOfReceiving string `json:"dateOfReceiving" db:"date_of_receiving"`
	Status          string `json:"status" db:"status"`
}

type PartUpdateLocationDTO struct {
	Id              *string `json:"id" db:"id"`
	InstrumentId    *string `json:"instrumentId" db:"instrument_id"`
	Person          *string `json:"person" db:"person"`
	Department      *string `json:"department" db:"department"`
	DateOfIssue     *string `json:"dateOfIssue" db:"date_of_issue"`
	DateOfReceiving *string `json:"dateOfReceiving" db:"date_of_receiving"`
	Status          *string `json:"status" db:"status"`
}

type ReceivingDTO struct {
	InstrumentId    string `json:"instrumentId" db:"instrument_id"`
	Status          string `json:"status" db:"status"`
	DateOfReceiving string `json:"dateOfReceiving" db:"date_of_receiving"`
}

type ReceivingFromBotDTO struct {
	UserMostId string `json:"userId" binding:"required"`
}
