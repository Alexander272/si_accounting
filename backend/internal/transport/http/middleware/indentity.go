package middleware

import (
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/gin-gonic/gin"
)

func (m *Middleware) VerifyToken(c *gin.Context) {
	tokenInHeader := c.GetHeader("Authorization")
	tokenInCookie, _ := c.Cookie(m.CookieName)

	if tokenInHeader == "" && tokenInCookie == "" {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty token", "сессия не найдена")
		return
	}

	token := tokenInCookie
	if tokenInHeader != "" {
		token = strings.Replace(tokenInHeader, "Bearer ", "", 1)
	}

	result, err := m.Keycloak.Client.RetrospectToken(c, token, m.Keycloak.ClientId, m.Keycloak.ClientSecret, m.Keycloak.Realm)
	if err != nil {
		c.SetCookie(m.CookieName, "", -1, "/", c.Request.Host, m.auth.Secure, true)
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "сессия не найдена")
		return
	}

	// logger.Debug("result ", result)

	if !*result.Active {
		// если он протух надо пробовать его обновлять

		_, token, err = m.services.Session.Refresh(c, token)
		if err != nil {
			c.SetCookie(m.CookieName, "", -1, "/", c.Request.Host, m.auth.Secure, true)
			response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "не удалось обновить сессию")
			return
		}

		c.SetCookie(m.CookieName, token, int(m.auth.RefreshTokenTTL.Seconds()), "/", m.auth.Domain, m.auth.Secure, true)

		// response.NewErrorResponse(c, http.StatusUnauthorized, "Invalid or expired Token", "user in not authorized")
		// return
	}

	// m.Keycloak.Client.RefreshToken()

	// jwt, claims, err := m.Keycloak.Client.DecodeAccessToken(c, token, m.Keycloak.Realm)
	user, err := m.services.Session.DecodeToken(c, token)
	if err != nil {
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "токен доступа не валиден")
		return
	}

	// logger.Debug(user)
	c.Set(m.CtxUser, user)

	// logger.Debug(" ")
	// logger.Debug("jwt ", jwt)
	// logger.Debug(" ")
	// logger.Debug("claims ", claims)

	c.Next()
}
