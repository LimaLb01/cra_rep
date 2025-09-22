-- Criar usuário de teste para o sistema de reconhecimento facial
INSERT INTO usuarios_faciais (nome_completo, email, matricula, empresa, cargo, ativo, data_cadastro) 
VALUES ('Usuário Teste', 'usuario.teste@empresa.com', '12345', 'RandonCorp', 'Desenvolvedor', true, NOW())
ON CONFLICT (nome_completo) DO UPDATE SET 
    email = EXCLUDED.email,
    matricula = EXCLUDED.matricula,
    empresa = EXCLUDED.empresa,
    cargo = EXCLUDED.cargo,
    ativo = EXCLUDED.ativo;

-- Verificar se o usuário foi criado
SELECT * FROM usuarios_faciais WHERE nome_completo = 'Usuário Teste';
