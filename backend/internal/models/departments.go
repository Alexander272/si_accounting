package models

type Department struct {
	Id       string `json:"id" db:"id"`
	Name     string `json:"name" db:"name"`
	LeaderId string `json:"leaderId" db:"leader_id"`
}
