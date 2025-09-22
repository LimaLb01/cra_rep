-- Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE public.usuarios_faciais DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios_faciais';
