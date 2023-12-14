package users

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type UserHandlers struct {
	service services.User
}

func NewUserHandlers(service services.User) *UserHandlers {
	return &UserHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.User) {
	handlers := NewUserHandlers(service)

	users := api.Group("/users")
	{
		users.GET("/:departmentId", handlers.GetByDepartment)
		users.POST("", handlers.Create)
		users.PUT("/:id", handlers.Update)
		users.DELETE("/:id", handlers.Delete)
	}
}

func (h *UserHandlers) GetByDepartment(c *gin.Context) {
	departmentId := c.Param("departmentId")
	if departmentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id подразделения не задан")
		return
	}

	users, err := h.service.GetByDepartment(c, departmentId)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), departmentId)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: users})
}

func (h *UserHandlers) Create(c *gin.Context) {
	var dto models.WriteUserDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Пользователь создан"})
}

func (h *UserHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
		return
	}

	var dto models.WriteUserDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные пользователя обновлены"})
}

func (h *UserHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), id)
		return
	}

	c.JSON(http.StatusNoContent, response.IdResponse{})
}
