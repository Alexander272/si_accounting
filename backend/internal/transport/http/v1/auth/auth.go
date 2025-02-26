package auth

import (
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	service    services.Session
	middleware *middleware.Middleware
	auth       config.AuthConfig
}

type Deps struct {
	Service    services.Session
	Middleware *middleware.Middleware
	Auth       config.AuthConfig
}

func NewAuthHandlers(deps Deps) *AuthHandler {
	return &AuthHandler{
		service:    deps.Service,
		middleware: deps.Middleware,
		auth:       deps.Auth,
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
	dto := &models.SignIn{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	user, err := h.service.SignIn(c, dto)
	if err != nil {
		logger.Info("Неудачная попытка авторизации",
			logger.StringAttr("section", "auth"),
			logger.StringAttr("ip", c.ClientIP()),
			logger.StringAttr("username", dto.Username),
			logger.ErrAttr(err),
		)

		if strings.Contains(err.Error(), "invalid_grant") {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	domain := h.auth.Domain
	if !strings.Contains(c.Request.Host, domain) {
		domain = c.Request.Host
	}

	roleCookie := &models.Identity{
		UserId: user.Id,
		Roles:  user.Roles,
	}
	role, err := roleCookie.String()
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), roleCookie)
		return
	}

	logger.Info("Пользователь успешно авторизовался",
		logger.StringAttr("section", "auth"),
		logger.StringAttr("ip", c.ClientIP()),
		logger.StringAttr("user", user.Name),
		logger.StringAttr("user_id", user.Id),
	)

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(constants.AuthCookie, user.RefreshToken, int(h.auth.RefreshTokenTTL.Seconds()), "/", domain, h.auth.Secure, true)
	c.SetCookie(constants.IdentityCookie, role, int(h.auth.RefreshTokenTTL.Seconds()), "/", c.Request.Host, h.auth.Secure, true)
	c.JSON(http.StatusOK, response.DataResponse{Data: user})
}

func (h *AuthHandler) SignOut(c *gin.Context) {
	refreshToken, err := c.Cookie(constants.AuthCookie)
	if err != nil {
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
		return
	}

	if err := h.service.SignOut(c, refreshToken); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), refreshToken)
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
	c.SetCookie(constants.AuthCookie, "", -1, "/", domain, h.auth.Secure, true)
	c.SetCookie(constants.IdentityCookie, "", -1, "/", c.Request.Host, h.auth.Secure, true)
	c.JSON(http.StatusNoContent, response.IdResponse{})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(constants.AuthCookie)
	if err != nil {
		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
		return
	}

	realm := c.GetHeader("realm")
	err = uuid.Validate(realm)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Сессия не найдена")
		return
	}

	req := &models.RefreshDTO{
		Token: refreshToken,
		Realm: realm,
	}

	user, err := h.service.Refresh(c, req)
	if err != nil {
		if strings.Contains(err.Error(), "invalid_grant") {
			response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "Сессия не найдена")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), req)
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

	cookie := &models.Identity{
		UserId: user.Id,
		Roles:  user.Roles,
	}
	identity, err := cookie.String()
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), cookie)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(constants.AuthCookie, user.RefreshToken, int(h.auth.RefreshTokenTTL.Seconds()), "/", domain, h.auth.Secure, true)
	c.SetCookie(constants.IdentityCookie, identity, int(h.auth.RefreshTokenTTL.Seconds()), "/", c.Request.Host, h.auth.Secure, true)
	c.JSON(http.StatusOK, response.DataResponse{Data: user})
}
