import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { queryDocuments } from '../firebase';
import { isPetFavorited, toggleFavorite } from '../services/favoritesService';

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

interface PetCardFullWidthProps {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  type?: 'cat' | 'dog';
  onPress?: () => void;
}

const getPetTypeFromBreed = (breed?: string): 'cat' | 'dog' => {
  if (!breed) return 'dog';
  const catBreeds = ['persa', 'siamês', 'angorá', 'sphynx'];
  return catBreeds.some(catBreed => 
    breed.toLowerCase().includes(catBreed)
  ) ? 'cat' : 'dog';
};

const PetCardFullWidth = ({ 
  id,
  name, 
  description, 
  imageUri, 
  type = 'dog',
  onPress 
}: PetCardFullWidthProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if pet is favorited when component mounts
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const favorited = await isPetFavorited(id);
        setIsFavorite(favorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkIfFavorite();
  }, [id]);

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      const newFavoriteStatus = await toggleFavorite(id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isBase64 = (str: string) => {
    return str.startsWith('data:image/');
  };

  const handleImageError = (e: any) => {
    console.log('Erro ao carregar imagem:', e.nativeEvent.error);
    if (imageUri && isBase64(imageUri)) {
      console.log('Possível problema com o formato da imagem base64');
    }
  };

  const renderImage = () => {
    if (!imageUri) {
      return (
        <View style={styles.imageContainer}>
          <Ionicons name="paw" size={48} color="#999" />
        </View>
      );
    }

    const uri = isBase64(imageUri) 
      ? imageUri 
      : imageUri;

    return (
      <Image 
        source={{ uri }} 
        style={styles.cardImage} 
        resizeMode="cover"
        onError={handleImageError}
      />
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.imageContainer}>
          {renderImage()}
        </View>
        
        <TouchableOpacity 
          style={[styles.favoriteButton, isLoading && { opacity: 0.7 }]}
          onPress={handleToggleFavorite}
          disabled={isLoading}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF3B30" : "#FFF"} 
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.cardText}>
            <Text style={styles.cardName} numberOfLines={1}>
              {name || 'Sem Nome'}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {description || 'Sem descrição disponível'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ResultsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get search parameters
  const searchQuery = (params.searchQuery as string) || 'Todos os Pets';
  const [isLoading, setIsLoading] = useState(true);
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
        setFilteredPets([]);
        return;
      }

      // Converte para o formato esperado
      const petsData: Pet[] = allPets.map((pet: any) => {
        // Verifica se a imagem está em base64 ou é uma URL
        const imageUrl = Array.isArray(pet.images) && pet.images.length > 0 
          ? pet.images[0] // Pega a primeira imagem do array
          : pet.imageUrl || 'https://placehold.co/400x300/CCCCCC/999999?text=Sem+Imagem';
          
        return {
          id: pet.id || '',
          name: pet.name || 'Sem Nome',
          description: pet.description || '',
          imageUrl: imageUrl,
          type: pet.type || getPetTypeFromBreed(pet.breed),
          breed: pet.breed || '',
          color: pet.color || '',
          gender: pet.gender || '',
          size: pet.size || '',
          isVaccinated: pet.isVaccinated || false,
          isNeutered: pet.isNeutered || false,
        };
      });

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
              onPress={() => router.push(`/pets/${pet.id}` as never)}
            />
          ))}

          {/* Espaço extra para rolagem */}
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonStyle: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mainContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  // Estilos para o card
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  cardContent: {
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  cardText: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#777',
  },
  cardAgeBadge: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginLeft: 8,
  },
  cardAgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#333',
  },
});

export default ResultsScreen;