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
            paddingHorizontal: 16,
        },
        // Estilos para telas pequenas
        smallScreen: {
            paddingHorizontal: 12,
        },
        // Estilos para telas médias
        mediumScreen: {
            paddingHorizontal: 16,
        },
        // Estilos para telas grandes
        largeScreen: {
            paddingHorizontal: 24,
        },
    });

    // Função auxiliar para determinar o tamanho da tela
    const getContentContainerStyle = (width: number) => {
        if (width < 640) {
            return [styles.contentContainer, styles.smallScreen];
        } else if (width < 1024) {
            return [styles.contentContainer, styles.mediumScreen];
        } else {
            return [styles.contentContainer, styles.largeScreen];
        }
    };

    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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