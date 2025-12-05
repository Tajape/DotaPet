import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Image, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hs as scale } from './utils/responsive';

import { queryDocuments } from '../firebase';
import { isPetFavorited, toggleFavorite } from '../services/favoritesService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - scale(40);

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
  const catBreeds = ['persa', 'siamês', 'angorá', 'sphynx'];
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
  const searchQuery = (params.searchQuery as string) || 'Todos os Pets';
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Handle do botão de voltar do sistema
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  // Função para carregar os resultados da busca
  const loadResults = useCallback(async () => {
    try {
      // Busca todos os pets do Firebase
      const allPets = await queryDocuments('pets');
      
      console.log('All pets fetched:', allPets); // Debug
      
      if (!allPets || allPets.length === 0) {
        setError('Nenhum pet encontrado.');
        setPets([]);
        setFilteredPets([]);
        return;
      }

      // Converte para o formato esperado
      const petsData: Pet[] = allPets.map((pet: any) => ({
        id: pet.id || '',
        name: pet.name || 'Sem Nome',
        description: pet.description || '',
        imageUrl: pet.imageUrl || 'https://placehold.co/400x300/CCCCCC/999999?text=Sem+Imagem',
        type: pet.type || getPetTypeFromBreed(pet.breed),
        breed: pet.breed || '',
        color: pet.color || '',
        gender: pet.gender || '',
        size: pet.size || '',
        isVaccinated: pet.isVaccinated || false,
        isNeutered: pet.isNeutered || false,
      }));

      setPets(petsData);

      // Filtra pelos critérios de busca
      const filtered = petsData.filter(pet => {
        const query = searchQuery.toLowerCase();
        return (
          pet.name?.toLowerCase().includes(query) ||
          pet.breed?.toLowerCase().includes(query) ||
          pet.color?.toLowerCase().includes(query) ||
          pet.description?.toLowerCase().includes(query)
        );
      });

      setFilteredPets(filtered);
      setError(null);
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Ocorreu um erro ao carregar os resultados.');
      setFilteredPets([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  // Função para o pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, [loadResults]);

  // Função para carregar os resultados quando a tela recebe foco
  const loadResultsOnFocus = useCallback(() => {
    setIsLoading(true);
    loadResults();
  }, [loadResults]);

  // Carregar resultados quando a tela é aberta
  useFocusEffect(
    useCallback(() => {
      loadResults();
      
      // Handle do botão de voltar
      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [loadResults, router])
  );

  // Recarregar quando os parâmetros de busca mudarem
  useEffect(() => {
    loadResults();
  }, [searchQuery, loadResults]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFC837" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </SafeAreaView>
    );
  }

  if (error || filteredPets.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonStyle}>
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

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#FFC837" />
          <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptySubText}>Tente buscar por outro termo</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonStyle}>
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFC837']}
            tintColor="#FFC837"
          />
        }>
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>
            {filteredPets.length > 0 
              ? `${filteredPets.length} resultado${filteredPets.length !== 1 ? 's' : ''} encontrado${filteredPets.length !== 1 ? 's' : ''}`
              : 'Nenhum resultado'
            }
          </Text>

          {/* Display filtered search results */}
          {filteredPets.map((pet) => (
            <PetCardFullWidth 
              key={pet.id}
              id={pet.id}
              name={pet.name}
              description={pet.description}
              imageUri={pet.imageUrl}
              type={pet.type || 'dog'}
              onPress={() => router.push(`/pet-details/${pet.id}` as never)}
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
// 2. COMPONENTE DE CARD DE PET (FULL WIDTH)
// =========================================================================

interface PetCardFullWidthProps {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  type: 'cat' | 'dog';
  onPress?: () => void;
}

const PetCardFullWidth: React.FC<PetCardFullWidthProps> = ({ 
  id,
  name, 
  description, 
  imageUri, 
  type,
  onPress 
}: PetCardFullWidthProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se o pet está nos favoritos ao carregar o componente
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const favorited = await isPetFavorited(id);
        setIsFavorite(favorited);
      } catch (error) {
        console.error('Erro ao verificar favorito:', error);
      }
    };

    checkIfFavorite();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      setIsLoading(true);
      const newFavoriteStatus = await toggleFavorite(id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      // Mostrar algum feedback para o usuário, se necessário
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.fullWidthPetCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.fullWidthCardImage} />
      
      {/* Ícone de favorito no canto superior direito */}
      <TouchableOpacity 
        style={[styles.fullWidthFavoriteButton, isLoading && { opacity: 0.7 }]}
        onPress={(e) => {
          e.stopPropagation(); // Impede que o onPress do card pai seja acionado
          if (!isLoading) {
            handleToggleFavorite();
          }
        }}
        disabled={isLoading}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={28} 
          color={isFavorite ? "#FF3B30" : "#FFF"} 
        />
      </TouchableOpacity>

      <View style={styles.fullWidthCardOverlay}>
        <View style={styles.fullWidthProfileIconContainer}>
          {/* Ícone do tipo de animal (Gato ou Cachorro) */}
          <Ionicons 
            name="paw"
            size={24} 
            color="#333" 
          />
        </View>
        <View style={styles.fullWidthCardInfo}>
          <Text style={styles.fullWidthCardName}>{name}</Text>
          <Text style={styles.fullWidthCardDescription} numberOfLines={2}>
            {description || 'Sem descrição disponível'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// =========================================================================
// 3. ESTILIZAÇÃO
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

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
  backButtonStyle: {
    marginRight: 10,
    padding: 5,
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
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },

  // --- ESTILO DE CARD FULL WIDTH ---
  fullWidthPetCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    alignSelf: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 5,
  },
  fullWidthCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidthProfileIconContainer: {
    backgroundColor: '#FFC837',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
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