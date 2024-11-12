package channel

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
)

type Handler struct {
	service services.Channel
}

func NewHandler(service services.Channel) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Channel, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	channels := api.Group("/channels")
	{
		channels.GET("", middleware.CheckPermissions(constants.Channel, constants.Read), handler.getAll)
		channels.POST("", middleware.CheckPermissions(constants.Channel, constants.Write), handler.create)
		channels.PUT("/:id", middleware.CheckPermissions(constants.Channel, constants.Write), handler.update)
		channels.DELETE("/:id", middleware.CheckPermissions(constants.Channel, constants.Write), handler.delete)
	}
}

func (h *Handler) getAll(c *gin.Context) {
	data, err := h.service.GetAll(c)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) create(c *gin.Context) {
	dto := &models.Channel{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Канал создан", logger.StringAttr("name", dto.Name), logger.StringAttr("id", dto.ID), logger.StringAttr("channelId", dto.MostChannelId))

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Канал создан"})
}

func (h *Handler) update(c *gin.Context) {
	dto := &models.Channel{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id канала не задан")
		return
	}
	dto.ID = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Канал обновлен", logger.StringAttr("name", dto.Name), logger.StringAttr("id", dto.ID), logger.StringAttr("channelId", dto.MostChannelId))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Канал обновлен"})
}

func (h *Handler) delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id канала не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}
	logger.Info("Канал удален", logger.StringAttr("id", id))

	c.JSON(http.StatusNoContent, response.StatusResponse{})
}
