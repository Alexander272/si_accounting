package menu_item

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/gin-gonic/gin"
)

type MenuItemHandlers struct {
	service services.MenuItem
	errBot  error_bot.ErrorBotApi
}

func NewMenuItemHandlers(service services.MenuItem, errBot error_bot.ErrorBotApi) *MenuItemHandlers {
	return &MenuItemHandlers{
		service: service,
		errBot:  errBot,
	}
}

func Register(api *gin.RouterGroup, service services.MenuItem, errBot error_bot.ErrorBotApi) {
	handlers := NewMenuItemHandlers(service, errBot)

	menu := api.Group("/menu-items")
	{
		menu.POST("", handlers.Create)
		menu.PUT("/:id", handlers.Update)
		menu.DELETE("/:id", handlers.Delete)
	}
}

func (h *MenuItemHandlers) Create(c *gin.Context) {
	var dto models.MenuItemDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	// if err := h.service.Create(c, dto); err != nil {
	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
	// 	h.errBot.Send(c, err.Error(), dto)
	// 	return
	// }

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Успешно создано"})
}

func (h *MenuItemHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
		return
	}

	var dto models.MenuItemDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	// if err := h.service.Update(c, dto); err != nil {
	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
	// 	h.errBot.Send(c, err.Error(), dto)
	// 	return
	// }

	c.JSON(http.StatusOK, response.IdResponse{Message: "Успешно обновлено"})
}

func (h *MenuItemHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), id)
		return
	}

	c.JSON(http.StatusNoContent, response.IdResponse{})
}
