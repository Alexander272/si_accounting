package models

type Menu struct {
	Id          string `json:"id" db:"id"`
	RoleId      string `json:"-" db:"role_id"`
	RoleName    string `json:"roleName" db:"name"`
	RoleNumber  int    `json:"roleNumber" db:"number"`
	RoleExtends string `json:"roleExtends" db:"extends"`
	MenuItemId  string `json:"menuItem" db:"menu_item_id"`
}

type MenuFull struct {
	Id string `json:"id" db:"id"`
	// RoleId    string     `json:"-" db:"role_id"`
	// Role      string     `json:"role" db:"role"`
	Role      RoleFull   `json:"role"`
	MenuItems []MenuItem `json:"menuItems"`
}

type MenuDTO struct {
	Id         string `json:"id"`
	RoleId     string `json:"roleId"`
	MenuItemId string `json:"menuItemId"`
}
