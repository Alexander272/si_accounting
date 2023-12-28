package middleware

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

func (m *Middleware) CheckPermissions(c *gin.Context) {
	u, exists := c.Get(m.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "сессия не найдена")
		return
	}

	user := u.(models.User)

	access, err := m.services.Permission.Enforce(user.Role, c.FullPath(), c.Request.Method)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		return
	}
	logger.Debug("permissions path - ", c.FullPath(), " method - ", c.Request.Method, ". permission access - ", access)

	if !access {
		response.NewErrorResponse(c, http.StatusForbidden, "access denied", "нет доступа к данному разделу")
		return
	}

	c.Next()
}
