import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface Pet {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type?: 'cat' | 'dog';
  breed?: string;
  color?: string;
  gender?: string;
  size?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
}

const getPetTypeFromBreed = (breed?: string): 'cat' | 'dog' => {
  if (!breed) return 'dog';
  const catBreeds = ['persa', 'siamês', 'siamês', 'angorá', 'sphynx'];
  return catBreeds.some(catBreed => 
    breed.toLowerCase().includes(catBreed)
  ) ? 'cat' : 'dog';
};

// =========================================================================
// 1. COMPONENTE PRINCIPAL (ResultsScreen)
// =========================================================================

const ResultsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get search parameters
  const searchQuery = params.searchQuery as string || 'Todos os Pets';
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Check if we have results in the params
        if (params.results) {
          const results = JSON.parse(params.results as string);
          setPets(results);
        } else {
          // If no results in params, try to fetch based on search query
          // This is a fallback in case the results weren't passed correctly
          // You might want to implement this part based on your app's needs
          setError('Nenhum resultado encontrado para esta busca.');
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Ocorreu um erro ao carregar os resultados.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [params]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFC837" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.errorContainer]}>
        <Ionicons name="warning-outline" size={48} color="#FFC837" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            Resultados de Busca
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {searchQuery}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>
            {pets.length > 0 
              ? `Mostrando ${pets.length} resultado${pets.length !== 1 ? 's' : ''} para: "${searchQuery}"`
              : `Nenhum resultado encontrado para: "${searchQuery}"`
            }
          </Text>

          {/* Display actual search results */}
          {pets.map((pet) => (
            <PetCardFullWidthPlaceholder 
              key={pet.id}
              name={pet.name}
              description={pet.description || 'Sem descrição disponível'}
              imageUri={pet.imageUrl || 'https://placehold.co/400x300/CCCCCC/999999?text=Sem+Imagem'}
              type={pet.type || getPetTypeFromBreed(pet.breed)}
            />
          ))}

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
  onPress?: () => void;
}

const PetCardFullWidthPlaceholder: React.FC<PetCardFullWidthProps> = ({ 
  name, 
  description, 
  imageUri, 
  type,
  onPress 
}: PetCardFullWidthProps) => (
  <TouchableOpacity style={styles.fullWidthPetCard} activeOpacity={0.9} onPress={onPress}>
    <Image source={{ uri: imageUri }} style={styles.fullWidthCardImage} />
    
    {/* Ícone de favorito no canto superior direito */}
    <TouchableOpacity style={styles.fullWidthFavoriteButton}>
      <Ionicons name="heart-outline" size={28} color="#FFF" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    color: '#333',
    fontWeight: '500',
  },
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