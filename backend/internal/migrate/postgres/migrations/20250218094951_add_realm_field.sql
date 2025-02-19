-- +goose Up
-- +goose StatementBegin
ALTER TABLE public.instruments ADD realm_id uuid NOT NULL DEFAULT '587b5e1d-c46b-48d5-8baf-251ceb6dcba1';
ALTER TABLE public.default_filters ADD realm_id uuid NOT NULL DEFAULT '587b5e1d-c46b-48d5-8baf-251ceb6dcba1';
ALTER TABLE public.departments ADD realm_id uuid NOT NULL DEFAULT '587b5e1d-c46b-48d5-8baf-251ceb6dcba1';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE public.instruments DROP COLUMN realm_id;
ALTER TABLE public.default_filters DROP COLUMN realm_id;
ALTER TABLE public.departments DROP COLUMN realm_id;
-- +goose StatementEnd
