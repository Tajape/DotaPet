import { Stack } from 'expo-router';
// Importe o seu contexto de autenticação ou crie uma variável temporária
// import { useAuth } from '../hooks/useAuth'; 

export default function RootLayout() {
    // ⚠️ SUBSTITUA ISTO PELA SUA LÓGICA DE AUTENTICAÇÃO REAL!
    // Por enquanto, vamos forçar para que seja 'false' (usuário deslogado)
    // assim sua tela 'welcome' aparece.
    const isAuthenticated = false; 
    
    // Você deve usar um hook real: const { isAuthenticated } = useAuth();

    return (
        <Stack>
            {/* O Stack.Screen usa o nome do arquivo (sem a extensão .tsx) */}
            
            {isAuthenticated ? (
                // 1. SE LOGADO: Mostra a navegação principal (abas/tabs)
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            ) : (
                // 2. SE DESLOGADO: Mostra a tela de Boas-Vindas
                <Stack.Screen 
                    name="welcome" // Aponta para o arquivo app/welcome.tsx
                    options={{ headerShown: false }} 
                />
            )}
            
            {/* Opcional: Rotas modais que devem estar disponíveis em qualquer estado */}
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
    );
}