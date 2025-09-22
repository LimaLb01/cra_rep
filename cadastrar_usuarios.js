// Script para cadastrar usuários no CompreFace
// Execute este script no console do navegador para cadastrar usuários

class CompreFaceUserManager {
    constructor() {
        this.apiKey = '9dafb0f7-bee3-4f05-84b0-9c12306e257d';
        this.baseUrl = 'https://compreface.empresasrandon.com/api/v1';
    }

    // Cadastrar usuário no CompreFace
    async cadastrarUsuario(subjectId, imageFile) {
        try {
            console.log(`📸 Cadastrando usuário: ${subjectId}`);
            
            // Converter imagem para base64
            const base64Data = await this.imageToBase64(imageFile);
            
            const response = await fetch(`${this.baseUrl}/faces`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    file: base64Data,
                    subject: subjectId
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao cadastrar: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Usuário cadastrado com sucesso:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Erro ao cadastrar usuário:', error);
            throw error;
        }
    }

    // Converter arquivo de imagem para base64
    imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Listar usuários cadastrados
    async listarUsuarios() {
        try {
            const response = await fetch(`${this.baseUrl}/faces`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao listar: ${response.status}`);
            }

            const result = await response.json();
            console.log('👥 Usuários cadastrados:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error);
            throw error;
        }
    }

    // Deletar usuário
    async deletarUsuario(subjectId) {
        try {
            const response = await fetch(`${this.baseUrl}/faces/${subjectId}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar: ${response.status}`);
            }

            console.log(`✅ Usuário ${subjectId} deletado com sucesso`);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error);
            throw error;
        }
    }

    // Cadastrar usuário com interface visual
    async cadastrarUsuarioComInterface() {
        // Criar input de arquivo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const subjectId = prompt('Digite o ID do usuário (ex: joao_silva_001):');
            if (!subjectId) return;
            
            try {
                await this.cadastrarUsuario(subjectId, file);
                alert(`✅ Usuário ${subjectId} cadastrado com sucesso!`);
            } catch (error) {
                alert(`❌ Erro ao cadastrar: ${error.message}`);
            }
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
}

// Instanciar o gerenciador
const userManager = new CompreFaceUserManager();

// Funções globais para uso no console
window.cadastrarUsuario = (subjectId, imageFile) => userManager.cadastrarUsuario(subjectId, imageFile);
window.listarUsuarios = () => userManager.listarUsuarios();
window.deletarUsuario = (subjectId) => userManager.deletarUsuario(subjectId);
window.cadastrarUsuarioComInterface = () => userManager.cadastrarUsuarioComInterface();

console.log('🎭 CompreFace User Manager carregado!');
console.log('📋 Comandos disponíveis:');
console.log('  - cadastrarUsuarioComInterface() - Cadastrar com interface visual');
console.log('  - listarUsuarios() - Listar usuários cadastrados');
console.log('  - deletarUsuario("subject_id") - Deletar usuário');
console.log('  - cadastrarUsuario("subject_id", imageFile) - Cadastrar programaticamente');
