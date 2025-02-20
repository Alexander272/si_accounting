package models

type Department struct {
	Id          string `json:"id" db:"id"`
	RealmId     string `json:"realmId" db:"realm_id"`
	Name        string `json:"name" db:"name"`
	LeaderId    string `json:"leaderId" db:"leader_id"`
	ChannelId   string `json:"channelId" db:"channel_id"`
	ChannelName string `json:"channelName" db:"channel_name"`
}
