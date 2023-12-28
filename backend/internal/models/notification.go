package models

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
