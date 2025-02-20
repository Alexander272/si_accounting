-- +goose Up
-- +goose StatementBegin
INSERT INTO public.menu_item (id, name, method, description, is_show) VALUES
    ('b51a5876-ca27-4515-b586-d2a1469c6e54','realms','read','Области',true),
    ('badf17d3-2e9e-403c-8d8a-111884bc5a0b','realms','write','Области',true),
    ('9be68a55-d9e2-47f1-a2dd-412fb0ad4ac1', 'roles', 'read', 'Роли', true),
    ('5fcafb7a-0d0e-4d3c-866b-a0bdc10ab07b', 'roles', 'write', 'Роли', true);

INSERT INTO public.menu (id, role_id, menu_item_id) VALUES
    ('bb4fc8bf-c536-405a-ade7-57f6b0fb42a1', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','b51a5876-ca27-4515-b586-d2a1469c6e54'), -- admin / realms | read
    ('44322bf8-fe23-420a-8c63-42bc45fae622', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','badf17d3-2e9e-403c-8d8a-111884bc5a0b'), -- admin / realms | write
    ('5803d482-d6b6-4341-a2af-8d132064f677', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','9be68a55-d9e2-47f1-a2dd-412fb0ad4ac1'), -- admin / roles | read
    ('7c21dc6c-3d9f-4bd7-9801-97dd198ba55f', '4b7a6cd0-f725-4033-a0e7-a65a028e84b6','5fcafb7a-0d0e-4d3c-866b-a0bdc10ab07b'); -- admin / roles | write
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM public.menu WHERE id IN ('bb4fc8bf-c536-405a-ade7-57f6b0fb42a1', '44322bf8-fe23-420a-8c63-42bc45fae622', '5803d482-d6b6-4341-a2af-8d132064f677', '7c21dc6c-3d9f-4bd7-9801-97dd198ba55f');
DELETE FROM public.menu_item WHERE id IN ('badf17d3-2e9e-403c-8d8a-111884bc5a0b', 'b51a5876-ca27-4515-b586-d2a1469c6e54', '9be68a55-d9e2-47f1-a2dd-412fb0ad4ac1', '5fcafb7a-0d0e-4d3c-866b-a0bdc10ab07b');
-- +goose StatementEnd
