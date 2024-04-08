package auth

import (
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service    services.Session
	auth       config.AuthConfig
	cookieName string
	errBot     error_bot.ErrorBotApi
}

type Deps struct {
	Service    services.Session
	Auth       config.AuthConfig
	CookieName string
	ErrBot     error_bot.ErrorBotApi
}

func NewAuthHandlers(deps Deps) *AuthHandler {
	return &AuthHandler{
		service:    deps.Service,
		auth:       deps.Auth,
		cookieName: deps.CookieName,
		errBot:     deps.ErrBot,
	}
}

func Register(api *gin.RouterGroup, deps Deps) {
	handlers := NewAuthHandlers(deps)

	auth := api.Group("/auth")
	{
		auth.POST("/sign-in", handlers.SignIn)
		auth.POST("/sign-out", handlers.SignOut)
		auth.POST("refresh", handlers.Refresh)
	}
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	var dto models.SignIn
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	user, err := h.service.SignIn(c, dto)
	if err != nil {
		logger.Info("Неудачная попытка авторизации",
			logger.StringAttr("section", "auth"),
			logger.StringAttr("ip", c.ClientIP()),
			logger.StringAttr("username", dto.Username),
			logger.ErrorAttr(err),
		)

		if strings.Contains(err.Error(), "invalid_grant") {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}

	domain := h.auth.Domain
	if !strings.Contains(c.Request.Host, domain) {
		domain = c.Request.Host
	}

	logger.Info("Пользователь успешно авторизовался",
		logger.StringAttr("section", "auth"),
		logger.StringAttr("ip", c.ClientIP()),
		logger.StringAttr("user", user.Name),
		logger.StringAttr("user_id", user.Id),
	)

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.cookieName, user.RefreshToken, int(h.auth.RefreshTokenTTL.Seconds()), "/", domain, h.auth.Secure, true)
	c.JSON(http.StatusOK, response.DataResponse{Data: user})
}

func (h *AuthHandler) SignOut(c *gin.Context) {
	refreshToken, err := c.Cookie(h.cookieName)
	if err != nil {
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
		return
	}

	if err := h.service.SignOut(c, refreshToken); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), refreshToken)
		return
	}

	domain := h.auth.Domain
	if !strings.Contains(c.Request.Host, domain) {
		domain = c.Request.Host
	}

	logger.Info("Пользователь вышел из системы",
		logger.StringAttr("section", "auth"),
		logger.StringAttr("ip", c.ClientIP()),
	)

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.cookieName, "", -1, "/", domain, h.auth.Secure, true)
	c.JSON(http.StatusNoContent, response.IdResponse{})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(h.cookieName)
	if err != nil {
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
		return
	}

	user, err := h.service.Refresh(c, refreshToken)
	if err != nil {
		if strings.Contains(err.Error(), "invalid_grant") {
			response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), refreshToken)
		return
	}

	domain := h.auth.Domain
	if !strings.Contains(c.Request.Host, domain) {
		domain = c.Request.Host
	}

	// logger.Info("Пользователь успешно обновил сессию",
	// 	logger.StringAttr("section", "auth"),
	// 	logger.StringAttr("ip", c.ClientIP()),
	// 	logger.StringAttr("user", user.Name),
	// 	logger.StringAttr("user_id", user.Id),
	// )

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.cookieName, user.RefreshToken, int(h.auth.RefreshTokenTTL.Seconds()), "/", domain, h.auth.Secure, true)
	c.JSON(http.StatusOK, response.DataResponse{Data: user})
}
