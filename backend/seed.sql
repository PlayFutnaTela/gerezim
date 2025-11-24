-- Seed Data
-- Note: This assumes a user exists. In a real scenario, you'd create a user first or use the current user's ID.
-- For this seed to work in the Supabase SQL Editor, you might need to replace 'USER_ID_PLACEHOLDER' with your actual User UID from Authentication.

-- Exemplo de Oportunidades
insert into opportunities (user_id, title, category, value, description, location, status, pipeline_stage)
values 
('USER_ID_PLACEHOLDER', 'Porsche 911 Carrera S', 'carro', 850000, 'Porsche 911 Carrera S 2021, único dono, 5.000km. Cor Cinza Agate.', 'São Paulo, SP', 'novo', 'Novo'),
('USER_ID_PLACEHOLDER', 'Apartamento Jardins', 'imovel', 2500000, 'Apartamento de alto padrão nos Jardins, 200m², 3 suítes.', 'São Paulo, SP', 'em_negociacao', 'Negociação'),
('USER_ID_PLACEHOLDER', 'Empresa de Logística', 'empresa', 5000000, 'Empresa de logística atuante no interior de SP, faturamento recorrente.', 'Campinas, SP', 'novo', 'Interessado'),
('USER_ID_PLACEHOLDER', 'Rolex Daytona', 'item_premium', 180000, 'Rolex Daytona Panda, novo na caixa, com garantia.', 'Rio de Janeiro, RJ', 'vendido', 'Finalizado');

-- Exemplo de Contatos
insert into contacts (user_id, name, phone, source, interests, status)
values
('USER_ID_PLACEHOLDER', 'Carlos Silva', '11999998888', 'Indicação', 'Interesse em carros esportivos', 'quente'),
('USER_ID_PLACEHOLDER', 'Mariana Souza', '11988887777', 'Instagram', 'Busca apartamento na zona sul', 'morno'),
('USER_ID_PLACEHOLDER', 'Roberto Justos', '11977776666', 'Networking', 'Investidor anjo, busca empresas', 'frio');
