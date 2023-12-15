package employees

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type EmployeeHandlers struct {
	service services.Employee
}

func NewEmployeeHandlers(service services.Employee) *EmployeeHandlers {
	return &EmployeeHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Employee) {
	handlers := NewEmployeeHandlers(service)

	employees := api.Group("/employees")
	{
		employees.GET("/:departmentId", handlers.GetByDepartment)
		employees.POST("", handlers.Create)
		employees.PUT("/:id", handlers.Update)
		employees.DELETE("/:id", handlers.Delete)
	}
}

func (h *EmployeeHandlers) GetByDepartment(c *gin.Context) {
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

func (h *EmployeeHandlers) Create(c *gin.Context) {
	var dto models.WriteEmployeeDTO
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

func (h *EmployeeHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
		return
	}

	var dto models.WriteEmployeeDTO
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

func (h *EmployeeHandlers) Delete(c *gin.Context) {
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
