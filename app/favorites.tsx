import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

// =========================================================================
// Componente auxiliar para a Tab Bar
// =========================================================================

interface TabItemProps {
    name: string;
    label: string;
    route: string;
    isFocused: boolean;
    onPress: (route: string) => void;
}

const TabItem: React.FC<TabItemProps> = ({ name, label, route, isFocused, onPress }) => (
    <TouchableOpacity
        key={route}
        style={styles.tabItem}
        onPress={() => onPress(route)}
    >
        <Ionicons
            name={isFocused ? name.replace('-outline', '') as "heart" : name as "heart-outline"}
            size={24}
            color={isFocused ? '#333' : '#666'}
        />
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
            {label}
        </Text>
    </TouchableOpacity>
);

// =========================================================================
// COMPONENTE PRINCIPAL (FavoritesScreen)
// =========================================================================

const FavoritesScreen = () => {
    const router = useRouter();
    const currentRoute = router.pathname || '/favorites'; 

    const handleGoBack = () => {
        // Garante que o usuário volte para a Home
        router.replace('/homeScreen' as never);
    };

    const handleTabPress = (route: string) => {
        if (route === currentRoute) {
            return; 
        }

        if (route === '/register-pet') {
            router.push('/register-pet' as never);
        } else {
            router.replace(route as never);
        }
    };

    const screenOptions = {
        headerShown: false,
        animation: 'none' as const,
    };

    // ✅ ESTADO VAZIO COM ELEMENTOS REORDENADOS
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            {/* 1. Texto de "Opss..." */}
            <Text style={styles.emptyText}>
                Opss... Parece que você ainda não adicionou nenhum pet...😢
            </Text>
            
            {/* 2. Ícone de Paw (Centralizado) */}
            <Ionicons name="paw" size={120} color="#ccc" style={styles.emptyIcon} />
            
            {/* 3. Texto de "Clique no coração" */}
            <Text style={styles.emptySubText}>
                Clique no coração (♡) ao lado dos pets que você gostar na tela inicial para vê-los aqui.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={screenOptions} />
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ------------------ 1. CABEÇALHO ------------------ */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Favoritos</Text>
            </View>

            {/* ------------------ 2. CONTEÚDO PRINCIPAL ------------------ */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderEmptyState()}
            </ScrollView>

            {/* ------------------ 3. BARRA DE NAVEGAÇÃO INFERIOR ------------------ */}
            <View style={styles.tabBarContainer}>

                <TabItem name="home-outline" label="Início" route="/homeScreen" isFocused={currentRoute === '/homeScreen'} onPress={handleTabPress} />
                <TabItem name="search-outline" label="Pesquisar" route="/searchScreen" isFocused={currentRoute === '/searchScreen'} onPress={handleTabPress} />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleTabPress('/register-pet')}
                >
                    <Ionicons name="add" size={32} color="#333" />
                </TouchableOpacity>

                <TabItem
                    name="heart-outline"
                    label="Favoritos"
                    route="/favorites"
                    isFocused={currentRoute === '/favorites'}
                    onPress={handleTabPress}
                />

                <TabItem
                    name="person-outline"
                    label="Perfil"
                    route="/my-profile"
                    isFocused={currentRoute === '/my-profile'}
                    onPress={handleTabPress}
                />
            </View>
        </SafeAreaView>
    );
};

// =========================================================================
// ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
    // --- Estrutura Básica ---
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // Garante que o scroll content ocupe o espaço para centralizar o estado vazio
    scrollContent: {
        flexGrow: 1, 
        paddingHorizontal: 30,
        paddingBottom: 100, 
    },

    // --- 1. Cabeçalho Personalizado ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10, 
        paddingVertical: 15,
        backgroundColor: '#fff', 
        borderBottomWidth: 1,
        borderBottomColor: '#eee', 
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 15,
    },
    backButton: {
        padding: 5, 
        marginRight: 15, 
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },

    // --- 2. Estado Vazio (Empty State) - AJUSTADO PARA ALINHAMENTO ---
    emptyContainer: {
        flex: 1, // ✅ Ocupa o espaço disponível (do scrollContent)
        alignItems: 'center',
        justifyContent: 'space-around', // ✅ Distribui o espaço uniformemente entre os elementos
        textAlign: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
        lineHeight: 30,
        textAlign: 'center',
    },
    emptyIcon: {
        // ✅ Estilo para o ícone central
        marginVertical: 40,
        opacity: 0.7,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },

    // --- 3. Bottom Tab Bar (Mantida Consistente) ---
    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        backgroundColor: '#FFC837',
        height: 85,
        paddingHorizontal: 5,
        paddingTop: 8,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#666',
        marginTop: 2,
    },
    tabLabelFocused: {
        color: '#333',
        fontWeight: '700',
    },
    addButton: {
        backgroundColor: '#fff',
        width: 65,
        height: 65,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        borderWidth: 5,
        borderColor: '#FFC837',
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 8,
    },
});

export default FavoritesScreen;