// MyProfileScreen.tsx

import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
// Importação de options da Stack para transição
import { Stack, useRouter, StackScreenOptions } from 'expo-router'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

// Dados de perfil simulados
const USER_DATA = {
    profileImageUri: 'https://i.imgur.com/y30fT2v.png', 
    name: 'Jhonatan Henrique', 
    location: 'Chã da jaqueira, Maceió AL',
};

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
        // Usamos replace para melhor simular a troca de abas (melhor transição)
        onPress={() => onPress(route)} 
    >
        <Ionicons 
            name={isFocused ? name.replace('-outline', '') as "person" : name as "person-outline"} 
            size={24} 
            color={isFocused ? '#333' : '#666'} 
        />
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
            {label}
        </Text>
    </TouchableOpacity>
);


// =========================================================================
// COMPONENTE PRINCIPAL (MyProfileScreen)
// =========================================================================

const MyProfileScreen = () => {
    const router = useRouter();
    const currentRoute = '/my-profile'; 

    const handleGoBack = () => {
        router.back();
    };

    const handleEditProfile = () => {
        router.push('/user-profile' as never); 
    };

    const handleLogout = () => {
        console.log('Usuário deslogado!');
    };

    const handleTabPress = (route: string) => {
        // Usamos router.replace para evitar acumular telas na navegação principal (tab bar)
        router.replace(route as never); 
    };

    // Configuração de opções da tela para transição suave
    const screenOptions: StackScreenOptions = {
        headerShown: false,
        // Garante que a transição de slide padrão seja usada
        animation: 'none' as const, 
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={screenOptions} />
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ------------------ 1. CABEÇALHO PERSONALIZADO ------------------ */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ------------------ 2. INFORMAÇÕES DO USUÁRIO ------------------ */}
                <View style={styles.profileInfo}>
                    <Image
                        source={{ uri: USER_DATA.profileImageUri }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{USER_DATA.name}</Text>
                    <Text style={styles.userLocation}>{USER_DATA.location}</Text>
                </View>

                {/* ------------------ 3. BOTÕES DE AÇÃO ------------------ */}
                <View style={styles.actionButtonsContainer}>
                    {/* Minhas Candidaturas */}
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.buttonContent}>
                            <Ionicons name="paw" size={24} color="#333" /> 
                            <Text style={styles.actionButtonText}>Minhas candidaturas</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#999" />
                    </TouchableOpacity>

                    {/* Meus Favoritos */}
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.buttonContent}>
                            <Ionicons name="heart" size={24} color="#333" />
                            <Text style={styles.actionButtonText}>Meus Favoritos</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#999" />
                    </TouchableOpacity>
                </View>
                
                {/* ------------------ 4. AÇÕES DE EDIÇÃO E LOGOUT (LIMPO) ------------------ */}
                <View style={styles.editLogoutSection}>
                    {/* Botão de Edição (ÚNICO) */}
                    <TouchableOpacity 
                        onPress={handleEditProfile} 
                        style={styles.textLink}
                    >
                        <Text style={styles.textLinkText}>Editar Perfil</Text>
                    </TouchableOpacity>

                    {/* Link para Sair da Conta */}
                    <TouchableOpacity 
                        onPress={handleLogout} 
                        style={styles.textLink}
                    >
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 100 }} /> 

            </ScrollView>

            {/* ------------------ 5. BARRA DE NAVEGAÇÃO INFERIOR (FIXA) ------------------ */}
            <View style={styles.tabBarContainer}>
                
                <TabItem name="home-outline" label="Início" route="/homeScreen" isFocused={false} onPress={handleTabPress} />
                <TabItem name="search-outline" label="Pesquisar" route="/searchScreen" isFocused={false} onPress={handleTabPress} />
                
                {/* Botão Central de Adicionar */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => handleTabPress('/register-pet')}
                >
                    <Ionicons name="add" size={32} color="#333" />
                </TouchableOpacity>

                <TabItem name="heart-outline" label="Favoritos" route="/favorites" isFocused={false} onPress={handleTabPress} />
                
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

// ... (Estilos, sem mudanças nos estilos)
const styles = StyleSheet.create({
    // --- Estrutura Básica ---
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 20, 
    },
    
    // --- 1. Cabeçalho Personalizado ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 15,
    },
    backButton: {
        paddingRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },

    // --- 2. Informações do Usuário ---
    profileInfo: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    userLocation: {
        fontSize: 16,
        color: '#888',
    },

    // --- 3. Botões de Ação ---
    actionButtonsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 15,
    },

    // --- 4. Ações de Edição e Logout ---
    editLogoutSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionTitle: { // Mantendo o estilo caso você decida reintroduzir o título
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    textLink: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    textLinkText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'red', 
    },

    // --- 5. Bottom Tab Bar ---
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

export default MyProfileScreen;