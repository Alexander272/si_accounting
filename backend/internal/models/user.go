package models

type User struct {
	Id   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Role string `json:"role"`

	AccessToken  string `json:"token"`
	RefreshToken string `json:"-"`
}
