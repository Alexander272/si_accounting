-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.documents
(
    id uuid NOT NULL,
    instrument_id uuid,
    verification_id uuid,
    label text COLLATE pg_catalog."default" NOT NULL,
    size integer NOT NULL,
    path text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT files_pkey PRIMARY KEY (id),
    CONSTRAINT documents_instrument_id_fkey FOREIGN KEY (instrument_id)
        REFERENCES public.instruments (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT documents_verification_id_fkey FOREIGN KEY (verification_id)
        REFERENCES public.verification_history (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.documents
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.documents;
-- +goose StatementEnd
