import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { width } = useWindowDimensions();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
        },
        contentContainer: {
            flex: 1,
            width: '100%',
            maxWidth: 1280,
            marginHorizontal: 'auto',
            // 💡 AJUSTE 1: Removendo o padding padrão aqui para que a função o defina
            paddingHorizontal: 0, 
        },
        // 🚀 AJUSTE 2: Definindo paddingHorizontal como ZERO para telas pequenas (Mobile)
        smallScreen: { 
            paddingHorizontal: 0, 
        },
        // Estilos para telas médias (mantendo o padding para web/desktop)
        mediumScreen: { 
            paddingHorizontal: 16,
        },
        // Estilos para telas grandes (mantendo o padding para web/desktop)
        largeScreen: {
            paddingHorizontal: 24,
        },
    });

    // Função auxiliar para determinar o tamanho da tela
    const getContentContainerStyle = (width: number) => {
        // Para telas menores que 640px (smartphones), aplicamos o padding ZERO
        if (width < 640) {
            return [styles.contentContainer, styles.smallScreen];
        } 
        // Para telas maiores, mantemos a lógica original de padding
        else if (width < 1024) {
            return [styles.contentContainer, styles.mediumScreen];
        } else {
            return [styles.contentContainer, styles.largeScreen];
        }
    };

    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFC837" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 💡 A View abaixo recebe o estilo que remove o padding horizontal se for tela pequena */}
            <View style={getContentContainerStyle(width)}>
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
                    <Stack.Screen name="favorites" options={{ headerShown: false }} />
                    <Stack.Screen name="my-profile" options={{ headerShown: false }} />
                    <Stack.Screen name="searchScreen" options={{ headerShown: false }} />
                    <Stack.Screen name="results" options={{ headerShown: false }} />
                    <Stack.Screen name="register-pet" options={{ headerShown: false }} />
                    <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="new-password" options={{ headerShown: false }} />
                    <Stack.Screen name="verify-code" options={{ headerShown: false }} />

                    {/* Opcional: Rotas modais que devem estar disponíveis em qualquer estado */}
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                </Stack>
            </View>
        </View>
    );
}