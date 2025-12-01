import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { queryDocuments } from '../firebase';
import { getCurrentUser } from '../services/authService';

// Definição de tipos para as props do componente TabItem
interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isFocused: boolean;
}

// Dados de perfil simulados para o cabeçalho
const MOCK_USER_PROFILE = {
  imageUri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU', 
  username: 'SeuUsuário',
};

// =========================================================================
// 1. COMPONENTE PRINCIPAL (HomeScreen)
// =========================================================================

const HomeScreen = () => {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentRoute: string = '/(tabs)';

  // Carregar pets do usuário ao montar
  useEffect(() => {
    const loadUserPets = async () => {
      setIsLoading(true);
      try {
        const user = getCurrentUser();
        if (!user) {
          console.log('Usuário não autenticado');
          return;
        }

        const userPets = await queryDocuments('pets', [
          where('ownerId', '==', user.uid)
        ]);
        setPets(userPets);
      } catch (error) {
        console.error('Erro ao carregar pets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserPets();
  }, []); 

  // --- Funções de Navegação CORRIGIDA FINAL ---
  const handleTabPress = (route: string) => {
    
    // ✅ CORREÇÃO PRINCIPAL: Ignora o clique se a rota for a atual
    if (route === currentRoute) {
      console.log(`Já está em ${route}. Navegação ignorada.`);
      return; 
    }

    if (route === '/register-pet') {
      // Usa push para adicionar a tela de cadastro sobre a atual
      router.push('/register-pet' as never); 
    } else if (route === '/searchScreen') {
      // Usa replace para navegação de tabs (melhor para a barra inferior)
      router.replace('/searchScreen' as never); 
    } else if (route === '/my-profile') {
      // Usa replace para navegação de tabs
      router.replace('/my-profile' as never);
    } else if (route === '/favorites') { 
      // ✅ AQUI ESTÁ A LIGAÇÃO PARA FAVORITOS (usando replace)
      router.replace('/favorites' as never); 
    } else if (route === '/homeScreen') {
       // Usa replace para navegação de tabs
       router.replace('/homeScreen' as never);
    }
  };

  // --- Componente TabItem (para a barra inferior) ---
  const TabItem: React.FC<TabItemProps> = ({ name, label, route, isFocused }) => (
    <TouchableOpacity
      key={route}
      style={styles.tabItem}
      onPress={() => handleTabPress(route)}
      // Desativa o toque se já estiver na tab atual
      disabled={isFocused && route === currentRoute} 
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
      <Stack.Screen options={{ headerShown: false, animation: 'none' as const }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" /> 

      {/* ------------------ 2. CABEÇALHO (FIXO) ------------------ */}
      <View style={styles.header}>
        {/* Ícone/Foto do Usuário */}
        <TouchableOpacity onPress={() => handleTabPress('/my-profile')} style={styles.profileButton} activeOpacity={0.7}>
          <Image
            source={{ uri: MOCK_USER_PROFILE.imageUri }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Barra de Pesquisa (BOTÃO VISUAL PARA NAVEGAR) */}
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => handleTabPress('/searchScreen')} 
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            Pesquisar por nome, raça ou localização...
          </Text>
        </TouchableOpacity>
        
      </View>

      {/* ------------------ 3. CONTEÚDO PRINCIPAL (SCROLLABLE - PLACEHOLDER) ------------------ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          
          <Text style={styles.sectionTitle}>Pets Prontos para Adoção</Text>
          
          {/* PLACEHOLDER GENÉRICO (Conforme sua imagem original) */}
          <View style={styles.placeholderCardContainer}>
            <Ionicons name="paw" size={40} color="#FFC837" style={{ marginBottom: 10 }} />
            <Text style={styles.placeholderText}>
              Este é o contêiner para os seus cards de animais!
            </Text>
            <Text style={styles.placeholderTextSmall}>
              Implemente o componente de card aqui (por exemplo, dentro de um FlatList).
            </Text>
          </View>

          <View style={{ height: 50 }} />
          
        </View>
      </ScrollView>

      {/* ------------------ 4. BARRA DE NAVEGAÇÃO INFERIOR (FIXA) ------------------ */}
      <View style={styles.tabBarContainer}>
        {/* Início (Focado) */}
        <TabItem 
          name="home-outline" 
          label="Início" 
          route="/homeScreen" 
          isFocused={currentRoute === '/homeScreen'} 
        />
        
        {/* Pesquisar: Rota para SearchScreen */}
        <TabItem 
          name="search-outline" 
          label="Pesquisar" 
          route="/searchScreen" 
          isFocused={currentRoute === '/searchScreen'} // Ajuste de isFocused
        />
        
        {/* Botão Central de Adicionar (LIGAÇÃO PARA /register-pet) */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleTabPress('/register-pet')} 
        >
          <Ionicons name="add" size={32} color="#333" />
        </TouchableOpacity>

        {/* ✅ FAVORITOS (Usando currentRoute para isFocused) */}
        <TabItem 
          name="heart-outline" 
          label="Favoritos" 
          route="/favorites" 
          isFocused={currentRoute === '/favorites'} 
        />
        
        {/* Perfil (Usando currentRoute para isFocused) */}
        <TabItem 
          name="person-outline" 
          label="Perfil" 
          route="/my-profile" 
          isFocused={currentRoute === '/my-profile'} 
        />
      </View>
      
    </SafeAreaView>
  );
};

// =========================================================================
// 5. ESTILIZAÇÃO
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
  
  // --- Barra de Pesquisa (Botão Visual) ---
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

  // --- Título de Seção ---
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },

  // --- Placeholder Card (Revertido) ---
  placeholderCardContainer: {
    backgroundColor: '#FFFBEA', 
    borderWidth: 2,
    borderColor: '#FFC837',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  placeholderTextSmall: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  tabLabelFocused: {
    color: '#333',
    fontWeight: '700',
  },
  
  // --- Botão Central de Adicionar ---
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