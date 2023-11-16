package documents

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type DocumentsHandlers struct {
	service services.Documents
	// TODO botApi
}

func NewDocumentsHandlers(service services.Documents) *DocumentsHandlers {
	return &DocumentsHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Documents) {
	handlers := NewDocumentsHandlers(service)

	documents := api.Group("/documents")
	{
		documents.GET("list", handlers.getList)
		documents.POST("", handlers.upload)
		documents.DELETE("/:id", handlers.delete)
	}
}

func (h *DocumentsHandlers) getList(c *gin.Context) {
	verificationId := c.Query("verificationId")
	// if verificationId == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
	// 	return
	// }
	// if verificationId == "temp" {
	// 	verificationId = ""
	// }

	instrumentId := c.Query("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
		return
	}

	docs, err := h.service.Get(c, models.GetDocumentsDTO{VerificationId: verificationId, InstrumentId: instrumentId})
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: docs})
}

func (h *DocumentsHandlers) upload(c *gin.Context) {
	// id := c.Query("id")
	// if id == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
	// 	return
	// }
	// if id == "temp" {
	// 	id = ""
	// }

	form, err := c.MultipartForm()
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Не удалось получить файлы")
		return
	}

	// var dto models.CreateVerificationDTO
	// if err := c.Bind(&dto); err != nil {
	// 	// response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
	// 	// return
	// }
	// logger.Debug(dto)

	instrumentId := form.Value["instrumentId"][0]
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
		return
	}
	verificationId := form.Value["verificationId"][0]
	// if verificationId == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
	// 	return
	// }

	files := form.File["files"]
	if len(files) == 0 {
		response.NewErrorResponse(c, http.StatusNoContent, "no content", "Нет файлов для загрузки")
		return
	}
	// c.SaveUploadedFile()

	if err := h.service.Upload(c, models.DocumentsDTO{VerificationId: verificationId, InstrumentId: instrumentId, Files: files}); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Файлы загружены"})
}

func (h *DocumentsHandlers) delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id документа не задан")
		return
	}

	instrumentId := c.Query("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
		return
	}
	filename := c.Query("filename")
	if filename == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Имя файла не задано")
	}
	verificationId := c.Query("verificationId")

	req := models.DeleteDocumentsDTO{
		Id:             id,
		InstrumentId:   instrumentId,
		VerificationId: verificationId,
		Filename:       filename,
	}

	if err := h.service.Delete(c, req); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Файл удален"})
}
