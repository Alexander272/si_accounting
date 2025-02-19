-- +goose Up
-- +goose StatementBegin
INSERT INTO public.menu_item (id, name, method, description, is_show) VALUES
    ('badf17d3-2e9e-403c-8d8a-111884bc5a0b','realms','write','Области',true),
    ('b51a5876-ca27-4515-b586-d2a1469c6e54','realms','read','Области',true);

INSERT INTO public.menu (id, role_id, menu_item_id) VALUES
    ('bb4fc8bf-c536-405a-ade7-57f6b0fb42a1', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','b51a5876-ca27-4515-b586-d2a1469c6e54'), -- admin / realms | read
    ('44322bf8-fe23-420a-8c63-42bc45fae622', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','badf17d3-2e9e-403c-8d8a-111884bc5a0b'); -- admin / realms | write
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM public.menu WHERE id IN ('bb4fc8bf-c536-405a-ade7-57f6b0fb42a1', '44322bf8-fe23-420a-8c63-42bc45fae622');
DELETE FROM public.menu_item WHERE id IN ('badf17d3-2e9e-403c-8d8a-111884bc5a0b', 'b51a5876-ca27-4515-b586-d2a1469c6e54');
-- +goose StatementEnd
