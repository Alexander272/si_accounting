package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/google/uuid"
)

type DocumentsService struct {
	repo repository.Documents
	path string
}

func NewDocumentsService(repo repository.Documents) *DocumentsService {
	return &DocumentsService{
		repo: repo,
		//? path /files/si/[instrumentId]/[verificationId]/[documentId][type]
		//? or path /files/si/[instrumentId]/[verificationId]/[documentId]_[filename]
		//? or path /files/si/[instrumentId]/temp
		path: "files/si/",
	}
}

type Documents interface {
	Get(context.Context, models.GetDocumentsDTO) ([]models.Document, error)
	Upload(context.Context, models.DocumentsDTO) error
	ChangePath(context.Context, models.PathParts) error
	Delete(context.Context, models.DeleteDocumentsDTO) error
}

func (s *DocumentsService) Get(ctx context.Context, req models.GetDocumentsDTO) ([]models.Document, error) {
	docs, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get documents. error: %w", err)
	}
	return docs, nil
}

// TODO надо перемещать изображения при сохранении поверки и записывать ее Id

func (s *DocumentsService) Upload(ctx context.Context, data models.DocumentsDTO) error {
	docs := []models.Document{}

	documentTypes := map[string]string{
		"application/msword":          "doc",
		"application/x-extension-doc": "doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
		"application/x-extension-docx":                                            "doc",
		"application/vnd.oasis.opendocument.text":                                 "doc",
		"application/vnd.ms-excel":                                                "sheet",
		"application/x-extension-xls":                                             "sheet",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":       "sheet",
		"application/x-extension-xlsx":                                            "sheet",
		"application/pdf":                                                         "pdf",
		"image/png":                                                               "image",
		"image/jpeg":                                                              "image",
		"text/csv":                                                                "sheet",
	}

	for _, fh := range data.Files {
		doc := models.Document{
			Id:             uuid.NewString(),
			Label:          fh.Filename,
			Size:           fh.Size,
			VerificationId: data.VerificationId,
			InstrumentId:   data.InstrumentId,
			DocumentType:   documentTypes[fh.Header.Get("Content-Type")],
		}

		paths := []string{s.path, data.InstrumentId}
		if data.VerificationId != "" {
			paths = append(paths, data.VerificationId)
		} else {
			paths = append(paths, "temp")
		}
		paths = append(paths, fmt.Sprintf("%s_%s", doc.Id, fh.Filename))

		dst := path.Join(paths...)
		doc.Path = dst
		docs = append(docs, doc)

		// path := path.Join(s.path, data.VerificationId, )

		if err := s.SaveUploadedFile(fh, dst); err != nil {
			return fmt.Errorf("failed to save file. error: %w", err)
		}
	}

	if err := s.repo.CreateSeveral(ctx, docs); err != nil {
		return fmt.Errorf("failed to create documents. error: %w", err)
	}
	return nil
}

// SaveUploadedFile uploads the form file to specific dst.
func (s *DocumentsService) SaveUploadedFile(file *multipart.FileHeader, dst string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	if err = os.MkdirAll(filepath.Dir(dst), 0750); err != nil {
		return err
	}

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}

func (s *DocumentsService) ChangePath(ctx context.Context, req models.PathParts) error {
	if err := s.repo.UpdatePath(ctx, req); err != nil {
		return fmt.Errorf("failed to update path documents. error: %w", err)
	}

	newPath := path.Join(s.path, req.InstrumentId, req.VerificationId)
	srcPath := path.Join(s.path, req.InstrumentId, "temp")

	if err := os.Rename(srcPath, newPath); err != nil {
		return fmt.Errorf("failed to move files. error: %w", err)
	}
	return nil
}

func (s *DocumentsService) Delete(ctx context.Context, req models.DeleteDocumentsDTO) error {
	paths := []string{s.path, req.InstrumentId}
	if req.VerificationId != "" {
		paths = append(paths, req.VerificationId)
	} else {
		paths = append(paths, "temp")
	}
	paths = append(paths, fmt.Sprintf("%s_%s", req.Id, req.Filename))

	dst := path.Join(paths...)

	if err := os.Remove(dst); err != nil && !strings.Contains(err.Error(), "no such file") {
		return fmt.Errorf("failed to delete file. error: %w", err)
	}

	if err := s.repo.DeleteById(ctx, req.Id); err != nil {
		return fmt.Errorf("failed to delete document by id. error: %w", err)
	}
	return nil
}

// func (s *DocumentsService) DeleteFile(path string) error {
// 	if err := os.Remove(path); err != nil {
// 		return err
// 	}
// 	return nil
// }
