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

func Register(api *gin.RouterGroup, service services.Location, middleware *middleware.Middleware) {
	handlers := NewLocationHandlers(service)

	locations := api.Group("/locations")
	{
		locations.GET("/:instrumentId", middleware.CheckPermissions(constants.SI, constants.Read), handlers.GetLast)
		locations.GET("/all/:instrumentId", middleware.CheckPermissions(constants.SI, constants.Read), handlers.GetByInstrumentId)
		locations.POST("", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Create)
		locations.POST("/several", middleware.CheckPermissions(constants.SI, constants.Write), handlers.CreateSeveral)
		locations.PUT("/:id", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Update)
		// locations.POST("/receiving", handlers.Receiving)
		locations.DELETE("/:id", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Delete)
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
	var dto models.CreateLocationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
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
	var dto models.CreateSeveralLocationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	// создавать перемещение могут только люди из этого же подразделения, а если подразделение не нашлось, то доступны все////или все у кого уровень роли не ниже 5

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	dto.UserId = user.Id

	isFull, err := h.service.CreateSeveral(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.errBot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Инструменты перемещены", logger.StringAttr("user_id", user.Id))

	message := "Данные о месте нахождения успешно добавлены"
	if !isFull {
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

	var dto models.UpdateLocationDTO
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

// // TODO можно это вынести в отдельный пакет notification и там уже можно будет сделать подтверждение из почты и с защитой будет проще
// func (h *LocationHandlers) Receiving(c *gin.Context) {
// 	// если я буду делать подтверждение по почте там нельзя будет отправлять пост запрос и все нужные данные надо будет передавать в query

// 	//TODO есть проблема инструменты приходят одной кучей, как их принимать если пришла только часть?
// 	// похоже надо как-то делить все что приходит + надо наверное выводить держателя для метролога, чтобы она понимала у кого был инструмент

// 	var dto models.Confirmation
// 	if err := c.BindJSON(&dto); err != nil {
// 		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
// 		return
// 	}

// 	data := models.ReceivingDTO{
// 		InstrumentIds: dto.Context.InstrumentIds,
// 		Status:        dto.Context.Status,
// 	}

// 	if err := h.service.Receiving(c, data); err != nil {
// 		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
// 		error_bot.Send(c, err.Error(), dto)
// 		return
// 	}

// 	logger.Info("Получено инструменты",
// 		logger.StringAttr("user_id", dto.UserID),
// 		logger.StringAttr("user", dto.UserName),
// 		logger.StringAttr("instrument_ids", strings.Join(dto.Context.InstrumentIds, ",")),
// 	)

// 	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
// }

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

	logger.Info("Место нахождение инструмента удалено", logger.StringAttr("user_id", user.Id))

	c.JSON(http.StatusNoContent, response.IdResponse{})
}
