import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    
    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

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
            
            {/* Rotas de Autenticação (sempre disponíveis) */}
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="user-profile" options={{ headerShown: false }} />
            <Stack.Screen name="homeScreen" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="new-password" options={{ headerShown: false }} />
            <Stack.Screen name="verify-code" options={{ headerShown: false }} />
            
            {/* Opcional: Rotas modais que devem estar disponíveis em qualquer estado */}
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
    );
}