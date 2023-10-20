package auth

import (
	"context"

	"github.com/Alexander272/data_center/backend/pkg/logger"
	"github.com/Nerzal/gocloak/v13"
)

type KeycloakClient struct {
	Client       *gocloak.GoCloak // keycloak client
	ClientId     string           // clientId specified in Keycloak
	ClientSecret string           // client secret specified in Keycloak
	Realm        string           // realm specified in Keycloak
}

func NewKeycloakClient(url, clientId, realm string, adminName, adminPass string) *KeycloakClient {
	client := gocloak.NewClient(url)

	ctx := context.Background()

	token, err := client.LoginAdmin(ctx, adminName, adminPass, realm)
	if err != nil {
		logger.Fatalf("failed to login admin to keycloak. error: %s", err.Error())
	}

	clients, err := client.GetClients(ctx, token.AccessToken, realm, gocloak.GetClientsParams{ClientID: &clientId})
	if err != nil {
		logger.Fatalf("failed to get clients to keycloak. error: %s", err.Error())
	}
	//logger.Debug(clients)

	secret := *clients[0].Secret

	return &KeycloakClient{
		Client:       client,
		ClientId:     clientId,
		ClientSecret: secret,
		Realm:        realm,
	}
}
