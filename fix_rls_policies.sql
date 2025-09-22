-- Corrigir políticas RLS para permitir inserções
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Allow read access for all users" ON public.usuarios_faciais;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.usuarios_faciais;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.usuarios_faciais;

-- Criar políticas mais permissivas
CREATE POLICY "Allow all operations for usuarios_faciais" ON public.usuarios_faciais
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios_faciais';
