import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window'); // Pega a largura da tela
const CARD_WIDTH = width - 40; // Largura do card: largura da tela - padding (20 de cada lado)

// Dados de perfil simulados (Apenas para preencher o header visualmente)
const MOCK_USER_PROFILE = {
  imageUri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU',
  username: 'SeuUsuário',
};

// =========================================================================
// 1. COMPONENTE PRINCIPAL (ResultsScreen)
// =========================================================================

const ResultsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Captura o termo de busca ('q') passado pela tela anterior
  const searchTerm = params.q || 'Todos os Pets'; 

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Oculta o header padrão do expo-router */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ------------------ 2. CABEÇALHO (Adaptado da Home) ------------------ */}
      <View style={styles.header}>
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        {/* Informação de Perfil (MOCK) */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: MOCK_USER_PROFILE.imageUri }}
            style={styles.profileImage}
          />
        </View>

        {/* Título Dinâmico de Resultados */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            Resultados de Busca
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {searchTerm}
          </Text>
        </View>
      </View>

      {/* ------------------ 3. CONTEÚDO PRINCIPAL (Scrollable) ------------------ */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          
          {/* Título da Seção (Mostra o que foi buscado) */}
          <Text style={styles.sectionTitle}>
            Mostrando resultados para: "{searchTerm}"
          </Text>

          {/* SIMULAÇÃO DE CARDS DE PETS (Placeholders genéricos com o novo layout) */}
          <PetCardFullWidthPlaceholder 
            name="Garfield" 
            description="Um gato bem mansinho😉 Ele gosta de brincar muito e de carinho na..." 
            imageUri="https://img.freepik.com/fotos-gratis/gatinho-fofo-sentado-e-olhando-para-a-camera-no-fundo-preto_1000540-348.jpg?w=1380&t=st=1708890912~exp=1708891512~hmac=e2acfc4c1851e2202b545431682390a781b0a701918376ac1521a003302c0b49"
            type="cat" // Pode ser 'cat' ou 'dog' para o ícone
          />
          <PetCardFullWidthPlaceholder 
            name="Peter" 
            description="Cachorro muito fofinho💕, precisa de um lar e de um amigo pra brin..." 
            imageUri="https://img.freepik.com/fotos-gratis/adoravel-retrato-de-cachorrinho-isolado-no-fundo-branco_23-2150820786.jpg?w=1380&t=st=1708890983~exp=1708891583~hmac=69399435b5a228303b6016e792e3a79d20c58e72353a479ffc90f367fc366710"
            type="dog"
          />
          <PetCardFullWidthPlaceholder 
            name="Bolinha" 
            description="Pug brincalhão e cheio de energia, adora crianças e passeios no parque." 
            imageUri="https://img.freepik.com/fotos-gratis/tiro-foco-seletivo-de-um-adoravel-filhote-de-pug-dormindo-na-cama_181624-42869.jpg?w=1380&t=st=1708891007~exp=1708891607~hmac=e9cf41d8e151dd75cf6439e44ff2d23631f13b652875b16e09fb2a4d0ec5ed3f"
            type="dog"
          />
          <PetCardFullWidthPlaceholder 
            name="Miau" 
            description="Gatinha persa meiga, um pouco tímida mas muito carinhosa quando se sente segura." 
            imageUri="https://img.freepik.com/fotos-gratis/lindo-gato-persa-em-um-fundo-branco_1000540-425.jpg?w=1380&t=st=1708891030~exp=1708891630~hmac=f3844f2fb9a7b9735d1f56fc02fb71d7c3b88b32607f2ef84a14210a402377c8"
            type="cat"
          />

          {/* Espaço extra para rolagem */}
          <View style={{ height: 50 }} />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// =========================================================================
// 4. NOVO COMPONENTE DE CARD DE PET (FULL WIDTH - SIMILAR À HOME)
// =========================================================================

interface PetCardFullWidthProps {
    name: string;
    description: string;
    imageUri: string;
    type: 'cat' | 'dog';
}

const PetCardFullWidthPlaceholder: React.FC<PetCardFullWidthProps> = ({ name, description, imageUri, type }) => (
    <TouchableOpacity style={styles.fullWidthPetCard} activeOpacity={0.9}>
        <Image source={{ uri: imageUri }} style={styles.fullWidthCardImage} />
        
        {/* Ícone de favorito no canto superior direito */}
        <TouchableOpacity style={styles.fullWidthFavoriteButton}>
            <Ionicons name="heart-outline" size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.fullWidthCardOverlay}>
            <View style={styles.fullWidthProfileIconContainer}>
                {/* Ícone do tipo de animal (Gato ou Cachorro) */}
                <Ionicons 
                    name={type === 'cat' ? 'cat' : 'dog'} 
                    size={24} 
                    color="#FFF" 
                    style={styles.fullWidthPetTypeIcon} 
                />
            </View>
            <View style={styles.fullWidthCardInfo}>
                <Text style={styles.fullWidthCardName}>{name}</Text>
                <Text style={styles.fullWidthCardDescription} numberOfLines={2}>{description}</Text>
            </View>
        </View>
    </TouchableOpacity>
);


// =========================================================================
// 5. ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  // --- HEADER ---
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
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  profileContainer: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#CCC', // Pode ser alterado para uma cor mais neutra
  },
  titleContainer: {
    flex: 1,
    paddingLeft: 5,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  // --- CONTENT ---
  scrollContent: {
    paddingBottom: 20,
  },
  mainContent: {
    paddingHorizontal: 20, // Mantém o padding da Home
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },

  // --- NOVO ESTILO DE CARD FULL WIDTH ---
  fullWidthPetCard: {
    width: CARD_WIDTH, // Largura total com base no padding
    height: CARD_WIDTH * 1.1, // Um pouco mais alto que largo
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    alignSelf: 'center', // Centraliza o card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fullWidthCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullWidthFavoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.3)', // Fundo semi-transparente para o ícone
    borderRadius: 20,
    padding: 5,
  },
  fullWidthCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)', // Fundo branco semi-transparente
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 120, // Altura mínima para as informações
    flexDirection: 'row', // Para alinhar ícone e texto
    alignItems: 'center',
  },
  fullWidthProfileIconContainer: {
    backgroundColor: '#FFC837', // Fundo amarelo para o ícone do pet
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2, // Borda como na imagem
    borderColor: '#FFF',
    // Sombra para destacar o ícone
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  fullWidthPetTypeIcon: {
    // A cor já está definida no componente Ionicons
  },
  fullWidthCardInfo: {
    flex: 1,
  },
  fullWidthCardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  fullWidthCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ResultsScreen;