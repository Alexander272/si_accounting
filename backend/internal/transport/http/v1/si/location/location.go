package location

import (
	"errors"
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

type LocationHandlers struct {
	service services.Location
}

func NewLocationHandlers(service services.Location) *LocationHandlers {
	return &LocationHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Location, ware *middleware.Middleware) {
	handlers := NewLocationHandlers(service)

	delPerm := []*middleware.Permission{
		{Section: constants.Location, Method: constants.Write},
		{Section: constants.Reserve, Method: constants.Write},
	}

	locations := api.Group("/locations")
	{
		locations.GET("/:instrumentId", ware.CheckPermissions(constants.Location, constants.Read), handlers.GetLast)
		locations.GET("/all/:instrumentId", ware.CheckPermissions(constants.Location, constants.Read), handlers.GetByInstrumentId)
		locations.POST("", ware.CheckPermissions(constants.Location, constants.Write), handlers.Create)
		locations.POST("/several", ware.CheckPermissionsArray(delPerm), handlers.CreateSeveral)
		locations.PUT("/:id", ware.CheckPermissions(constants.Location, constants.Write), handlers.Update)
		// locations.POST("/receiving", handlers.Receiving)
		locations.DELETE("/:id", ware.CheckPermissionsArray(delPerm), handlers.Delete)
	}
}

func (h *LocationHandlers) GetLast(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	location, err := h.service.GetLast(c, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), err.Error())
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: location})
}

func (h *LocationHandlers) GetByInstrumentId(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	locations, err := h.service.GetByInstrumentId(c, instrumentId)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: locations})
}

func (h *LocationHandlers) Create(c *gin.Context) {
	dto := &models.CreateLocationDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		if errors.Is(err, models.ErrNoChannel) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Канал для получения уведомлений не указан")
			return
		}
		if errors.Is(err, models.ErrNoResponsible) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Ответственный не указан")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}
	logger.Info("Инструмент перемещен", logger.StringAttr("instrument_id", dto.InstrumentId), logger.StringAttr("user_id", user.Id))

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные о месте нахождения успешно добавлены"})
}

func (h *LocationHandlers) CreateSeveral(c *gin.Context) {
	dto := &models.CreateSeveralLocationDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	// создавать перемещение могут только люди из этого же подразделения, а если подразделение не нашлось, то доступны все

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	dto.UserId = user.Id

	// isFull, err := h.service.CreateSeveral(c, dto)
	full, err := h.service.CreateSeveral(c, dto)
	if err != nil {
		if errors.Is(err, models.ErrNoResponsible) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Вы не являетесь ответственным")
			return
		}
		if errors.Is(err, models.ErrNoInstrument) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Вы не можете переместить инструмент")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Инструменты перемещены", logger.StringAttr("user_id", user.Id))

	message := "Данные о месте нахождения успешно добавлены"
	if !full {
		message = "Данные о месте нахождения добавлены частично"
	}

	c.JSON(http.StatusCreated, response.IdResponse{Message: message})
}

func (h *LocationHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	dto := &models.UpdateLocationDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("Место нахождения инструмента изменено", logger.StringAttr("instrument_id", dto.InstrumentId), logger.StringAttr("user_id", user.Id))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

func (h *LocationHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("Место нахождение инструмента удалено", logger.StringAttr("user_id", user.Id), logger.StringAttr("location_id", id))

	c.JSON(http.StatusNoContent, response.IdResponse{})
}
