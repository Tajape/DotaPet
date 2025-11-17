import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router'; 
import Ionicons from 'react-native-vector-icons/Ionicons'; 

// Definição de tipos para as props do componente
interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isFocused: boolean;
}

// Dados de perfil simulados
const MOCK_USER_PROFILE = {
  imageUri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU', 
  username: 'SeuUsuário',
};

// =========================================================================
// 1. COMPONENTE PRINCIPAL (HomeScreen)
// =========================================================================

const HomeScreen = () => {
  // Mantemos o state, mas ele será pouco usado na Home após a correção
  const [searchQuery, setSearchQuery] = useState(''); 
  const router = useRouter();
  const currentRoute = '/homeScreen'; 

  const handleTabPress = (route: string) => {
    // A navegação da TabBar e da barra de pesquisa rápida
    if (route === '/searchScreen') {
      router.push('/searchScreen' as never); 
    } else if (route === '/register-pet') {
      router.push('/register-pet' as never); 
    } else if (route === '/user-profile') {
      router.push('/user-profile' as never);
    }
    // Adicione outras rotas conforme necessário
  };
  
  const TabItem: React.FC<TabItemProps> = ({ name, label, route, isFocused }) => (
    <TouchableOpacity
      key={route}
      style={styles.tabItem}
      onPress={() => handleTabPress(route)}
    >
      <Ionicons 
        name={isFocused ? name.replace('-outline', '') as "home" : name as "home-outline"} 
        size={24} 
        color={isFocused ? '#333' : '#666'} 
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" /> 

      {/* ------------------ 2. CABEÇALHO (FIXO) ------------------ */}
      <View style={styles.header}>
        {/* Ícone/Foto do Usuário */}
        <TouchableOpacity onPress={() => handleTabPress('/user-profile')} style={styles.profileButton}>
          <Image
            source={{ uri: MOCK_USER_PROFILE.imageUri }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Barra de Pesquisa (AGORA UM BOTÃO DE NAVEGAÇÃO LIMPO) */}
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => handleTabPress('/searchScreen')} // Navega ao tocar
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            Pesquisar por nome, raça ou localização...
          </Text>
        </TouchableOpacity>
        
      </View>

      {/* ------------------ 3. CONTEÚDO PRINCIPAL (SCROLLABLE) ------------------ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          
          <Text style={styles.sectionTitle}>Pets Prontos para Adoção</Text>
          
          <View style={styles.petListPlaceholder}>
            <Ionicons name="paw" size={40} color="#FFC837" />
            <Text style={styles.placeholderText}>
              Este é o contêiner para os seus cards de animais!
            </Text>
          </View>
          
          <View style={{ height: 600 }} />
          
        </View>
      </ScrollView>

      {/* ------------------ 4. BARRA DE NAVEGAÇÃO INFERIOR (FIXA) ------------------ */}
      <View style={styles.tabBarContainer}>
        <TabItem name="home-outline" label="Início" route="/homeScreen" isFocused={currentRoute === '/homeScreen'} />
        
        {/* Pesquisar: Rota para SearchScreen */}
        <TabItem name="search-outline" label="Pesquisar" route="/searchScreen" isFocused={false} />
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleTabPress('/register-pet')}
        >
          <Ionicons name="add" size={32} color="#333" />
        </TouchableOpacity>

        <TabItem name="heart-outline" label="Favoritos" route="/favorites" isFocused={false} />
        <TabItem name="person-outline" label="Perfil" route="/user-profile" isFocused={false} />
      </View>
      
    </SafeAreaView>
  );
};

// =========================================================================
// 5. ESTILIZAÇÃO (CORRIGIDA E OTIMIZADA)
// =========================================================================

const styles = StyleSheet.create({
  // --- Estrutura Básica ---
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80 + (Platform.OS === 'ios' ? 20 : 0), 
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  
  // --- Cabeçalho (Header) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },
  profileButton: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFC837',
  },
  
  // --- Barra de Pesquisa CORRIGIDA (Botão Visual) ---
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    height: 48, 
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#888',
  },

  // --- Título e Placeholder de Conteúdo ---
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },
  petListPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEA',
    borderRadius: 15,
    padding: 30,
    borderWidth: 2,
    borderColor: '#FFC837',
    borderStyle: 'dashed',
    minHeight: 180,
    marginTop: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },

  // --- Bottom Tab Bar ---
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
  
  // ... (Outros estilos da Tab Bar)
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

export default HomeScreen;