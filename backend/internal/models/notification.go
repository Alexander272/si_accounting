package models

import "time"

type NotificationTime struct {
	Id    string
	Type  string `yaml:"type"`
	Title string
	// Date time.Time
	// Add  time.Time
	Date time.Duration `yaml:"date"`
	Add  time.Duration `yaml:"add"`
	Sub  time.Duration `yaml:"sub"`
	// Sub  NotificationSubTime
}
type NotificationSubTime struct {
	// чет похоже это не правильно
	TimeId string
	// Value  time.Time
	Value time.Duration
}

type Notification struct {
	PostId string       `json:"postId"`
	MostId string       `json:"mostId"`
	Type   string       `json:"type"`
	SI     []SelectedSI `json:"si"`
}

type SelectedSI struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	FactoryNumber string `json:"factoryNumber"`
	Person        string `json:"person"`
}
