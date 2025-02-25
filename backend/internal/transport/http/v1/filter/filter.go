package filter

import (
	"net/http"

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

type Handler struct {
	service services.DefaultFilter
}

func NewHandler(service services.DefaultFilter) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.DefaultFilter, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	filter := api.Group("filters")
	{
		filter.GET("", handler.get)
		filter.POST("", handler.change)
	}
}

func (h *Handler) get(c *gin.Context) {
	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	identity, exists := c.Get(constants.CtxIdentity)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty identity", "Сессия не найдена")
		return
	}

	req := &models.GetFilterDTO{SSOId: user.Id, RealmId: identity.(models.Identity).Realm}
	data, err := h.service.Get(c, req)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), req)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) change(c *gin.Context) {
	dto := []*models.SIFilter{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	realm := c.GetHeader("realm")
	err := uuid.Validate(realm)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "invalid id param")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	filters := []*models.FilterDTO{}
	for _, f := range dto {
		for _, v := range f.Values {
			filters = append(filters, &models.FilterDTO{
				SSOId:       user.Id,
				RealmId:     realm,
				FilterName:  f.Field,
				CompareType: v.CompareType,
				Value:       v.Value,
			})
		}
	}
	data := &models.ChangeFilterDTO{
		SSOId:   user.Id,
		Filters: filters,
	}

	if err := h.service.Change(c, data); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Фильтры обновлены", logger.StringAttr("user_id", user.Id), logger.AnyAttr("filters", filters))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Фильтры обновлены"})
}
