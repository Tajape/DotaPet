import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocument, queryDocuments } from '../firebase';
import { getCurrentUser } from '../services/authService';

// Definição de tipos para as props do componente TabItem
interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isFocused: boolean;
}

// Dados de perfil simulados para fallback
const MOCK_USER_PROFILE = {
  imageUri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU',
  username: 'SeuUsuário',
};

// Tipagem simples para perfil
interface UserProfile {
  username?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  profileImage?: string | null;
}

// =========================================================================
// 1. COMPONENTE PRINCIPAL (HomeScreen)
// =========================================================================

const HomeScreen = () => {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const currentRoute: string = '/(tabs)';
  // Carregar perfil e pets do usuário ao montar
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      // carregar perfil salvo no Firestore
      const profile = await getDocument('users', user.uid);
      if (profile) setUserProfile(profile as UserProfile);

      // carregar TODOS os pets de todos os usuários
      const allPets = await queryDocuments('pets', []);
      setPets(allPets);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
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

  // Componente para renderizar cada card de pet
  const PetCard = ({ pet, index }: { pet: any; index: number }) => {
    const firstImage = Array.isArray(pet.images) && pet.images.length > 0 
      ? pet.images[0] 
      : (pet.image || MOCK_USER_PROFILE.imageUri);
    
    return (
      <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push(`/pets/${pet.id}` as never)}>
        <View style={styles.card}>
          <Image source={{ uri: firstImage }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{pet.name || 'Sem nome'}</Text>
              <Text numberOfLines={2} style={styles.cardDescription}>{pet.description || pet.details || ''}</Text>
            </View>
            <View style={styles.cardAgeBadge}>
              <Text style={styles.cardAgeText}>{pet.age || ''}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
              source={{ uri: userProfile?.profileImage || MOCK_USER_PROFILE.imageUri }}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.mainContent}>
          
          <Text style={styles.sectionTitle}>Seus Pets Registrados</Text>

          {isLoading ? (
            <View style={styles.placeholderCardContainer}>
              <Ionicons name="timer" size={36} color="#FFC837" style={{ marginBottom: 10 }} />
              <Text style={styles.placeholderText}>Carregando...</Text>
            </View>
          ) : pets && pets.length > 0 ? (
            <View>
              {pets.map((pet, idx) => (
                <PetCard key={pet.id || idx} pet={pet} index={idx} />
              ))}
            </View>
          ) : (
            <View style={styles.placeholderCardContainer}>
              <Ionicons name="paw" size={40} color="#FFC837" style={{ marginBottom: 10 }} />
              <Text style={styles.placeholderText}>
                Você ainda não registrou nenhum pet!
              </Text>
              <Text style={styles.placeholderTextSmall}>
                Toque no botão + para adicionar seu primeiro pet.
              </Text>
            </View>
          )}

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
  // --- Card de Pet ---
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F0F0F0',
  },
  petInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  // --- Novo estilo para cards (estilo semelhante ao anexo)
  cardWrapper: {
    marginBottom: 18,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cardAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
  },
  cardAgeBadge: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  cardAgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
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