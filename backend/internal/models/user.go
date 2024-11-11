package models

type User struct {
	Id      string      `json:"id" db:"id"`
	Name    string      `json:"name" db:"name"`
	Role    string      `json:"role"`
	Menu    []string    `json:"menu"`
	Filters []*SIFilter `json:"filters"`

	AccessToken  string `json:"token"`
	RefreshToken string `json:"-"`
}

type UserData struct {
	Id        string `json:"id" db:"id"`
	SSOId     string `json:"ssoId" db:"sso_id"`
	Username  string `json:"username" db:"username"`
	FirstName string `json:"firstName" db:"first_name"`
	LastName  string `json:"lastName" db:"last_name"`
	Email     string `json:"email" db:"email"`
}

// type KeycloakUser struct {
// 	Id        string `json:"id"`
// 	Username  string `json:"username"`
// 	FirstName string `json:"firstName"`
// 	LastName  string `json:"lastName"`
// 	Email     string `json:"email"`
// }
