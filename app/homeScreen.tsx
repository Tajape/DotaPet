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
// Adaptado para resolver o problema de compilação
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
  // URL de placeholder, altere para a imagem real do usuário
  imageUri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU', 
  username: 'SeuUsuário',
};

// =========================================================================
// 1. COMPONENTE PRINCIPAL (HomeScreen)
// =========================================================================

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Função Placeholder para navegação do Menu Inferior
  const handleTabPress = (route: string) => {
    console.log(`Navegar para: ${route}`);
    
    if (route === '/register-pet') {
      // O botão central leva para o cadastro
      // Usando o router.push para ir para a nova tela de cadastro (register-pet.tsx)
      router.push('/register-pet' as never); 
    } else if (route === '/user-profile') {
      // Navegação simulada para o perfil do usuário
      router.push('/user-profile' as never);
    } else {
      // router.push(route as never);
    }
  };

  // Funções de Ação do Header
  const handleSearch = () => {
    console.log('Pesquisar por:', searchQuery);
  };
  
  // Componente auxiliar para renderizar os itens da Tab Bar
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
      {/* Ajusta a StatusBar para que o texto fique legível sobre o fundo branco/claro */}
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

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome, raça ou localização..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ------------------ 3. CONTEÚDO PRINCIPAL (SCROLLABLE) ------------------ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          
          <Text style={styles.sectionTitle}>Pets Prontos para Adoção</Text>
          
          {/* PLACEHOLDER: ESPAÇO PARA OS CARDS DOS ANIMAIS */}
          <View style={styles.petListPlaceholder}>
            <Ionicons name="paw" size={40} color="#FFC837" />
            <Text style={styles.placeholderText}>
              Este é o contêiner para os seus cards de animais!
            </Text>
            <Text style={styles.placeholderText}>
              Implemente o componente de card aqui (por exemplo, dentro de um FlatList).
            </Text>
            {/* Exemplo de card de pet do seu design:  */}
          </View>
          
          {/* Adiciona espaço para testar a rolagem sem os cards */}
          <View style={{ height: 600 }} />
          
        </View>
      </ScrollView>

      {/* ------------------ 4. BARRA DE NAVEGAÇÃO INFERIOR (FIXA) ------------------ */}
      <View style={styles.tabBarContainer}>
        {/* Início (Focado) */}
        <TabItem name="home-outline" label="Início" route="/homeScreen" isFocused={true} />
        
        {/* Pesquisar */}
        <TabItem name="search-outline" label="Pesquisar" route="/explore" isFocused={false} />
        
        {/* Botão Central de Adicionar (Maior e Redondo) */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleTabPress('/register-pet')}
        >
          <Ionicons name="add" size={32} color="#333" />
        </TouchableOpacity>

        {/* Favoritos */}
        <TabItem name="heart-outline" label="Favoritos" route="/favorites" isFocused={false} />
        
        {/* Perfil */}
        <TabItem name="person-outline" label="Perfil" route="/user-profile" isFocused={false} />
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
    // Garante que o conteúdo role e tenha espaço acima da Tab Bar
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
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Ajuste para Android
  },
  profileButton: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFC837', // Borda amarela de destaque
  },
  
  // --- Barra de Pesquisa ---
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    height: 45, // Um pouco maior para melhor toque
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  searchIconContainer: {
    marginLeft: 10,
    padding: 5,
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
    backgroundColor: '#FFFBEA', // Fundo amarelo claro
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
    backgroundColor: '#FFC837', // Cor de destaque do design
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
    position: 'absolute', // Fixa no fundo
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
    marginTop: -30, // Puxa o botão para cima, sobrepondo a borda
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