package documents

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type DocumentsHandlers struct {
	service services.Documents
}

func NewDocumentsHandlers(service services.Documents) *DocumentsHandlers {
	return &DocumentsHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Documents, middleware *middleware.Middleware) {
	handlers := NewDocumentsHandlers(service)

	documents := api.Group("/documents")
	{
		documents.GET("list", middleware.CheckPermissions(constants.SI, constants.Read), handlers.getList)
		documents.POST("", middleware.CheckPermissions(constants.SI, constants.Write), handlers.upload)
		documents.GET("", middleware.CheckPermissions(constants.SI, constants.Write), handlers.download)
		documents.DELETE("/:id", middleware.CheckPermissions(constants.SI, constants.Write), handlers.delete)
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
	// if instrumentId == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
	// 	return
	// }

	dto := &models.GetDocumentsDTO{VerificationId: verificationId, InstrumentId: instrumentId}
	docs, err := h.service.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: docs})
}

func (h *DocumentsHandlers) download(c *gin.Context) {
	filePath := c.Query("path")

	logger.Debug(filePath)

	// file, err := os.ReadFile(filePath)
	// if err != nil {
	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Файл не найден")
	// 	h.errBot.Send(c, err.Error(), filePath)
	// 	return
	// }

	fileStat, err := os.Stat(filePath)
	if err != nil {
		if strings.Contains(err.Error(), "no such file or directory") {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), "Файл не найден")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Файл не найден")
		error_bot.Send(c, err.Error(), filePath)
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Length", fmt.Sprintf("%d", fileStat.Size()))
	c.Header("Content-Disposition", "attachment; filename="+fileStat.Name())
	c.File(filePath)
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
	// if instrumentId == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
	// 	return
	// }
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

	dto := &models.DocumentsDTO{VerificationId: verificationId, InstrumentId: instrumentId, Files: files}
	if err := h.service.Upload(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
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
	// if instrumentId == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id инструмента не задан")
	// 	return
	// }
	filename := c.Query("filename")
	if filename == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Имя файла не задано")
	}
	verificationId := c.Query("verificationId")

	req := &models.DeleteDocumentsDTO{
		Id:             id,
		InstrumentId:   instrumentId,
		VerificationId: verificationId,
		Filename:       filename,
	}

	if err := h.service.Delete(c, req); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), req)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Файл удален"})
}
