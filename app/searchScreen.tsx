import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { queryDocuments } from '../firebase';

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  
  // Search
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 10,
  },
  
  // Filters
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    marginLeft: 5,
    color: '#333',
    fontWeight: '500',
  },
  filtersPanel: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  filterOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterOptionSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filterOptionText: {
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  filterActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearFilterButton: {
    backgroundColor: '#f5f5f5',
  },
  clearFilterButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  applyFilterButton: {
    backgroundColor: '#4a90e2',
  },
  applyFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // History
  historyContainer: {
    flex: 1,
    padding: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  clearHistoryButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  historyIcon: {
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
    marginLeft: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  
  // Empty/Loading States
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
  },
  
  // Breed and Color Filters
  breedList: {
    maxHeight: 200,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
  },
  breedItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breedText: {
    fontSize: 16,
    color: '#333',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#4a90e2',
  },
});

// Constantes
const SEARCH_HISTORY_KEY = "@SearchHistory";

// =========================================================================
// 1. COMPONENTE PRINCIPAL (SearchScreen)
// =========================================================================

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para filtros
  interface PetFilters {
    gender: 'Macho' | 'Fêmea' | null;
    size: 'pequeno' | 'médio' | 'grande' | null;
    isVaccinated: boolean | null;
    isNeutered: boolean | null;
    breed: string;
    color: string;
  }

  const [filters, setFilters] = useState<PetFilters>({
    gender: null,
    size: null,
    isVaccinated: null,
    isNeutered: null,
    breed: '',
    color: '',
  });

  const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Carregar opções de filtros
  const loadFilterOptions = useCallback(async () => {
    try {
      setIsLoadingFilters(true);
      const pets = await queryDocuments('pets', []);
      const breeds = [...new Set(pets.map((pet: any) => pet.breed).filter(Boolean))] as string[];
      const colors = [...new Set(pets.map((pet: any) => pet.color).filter(Boolean))] as string[];
      
      setAvailableBreeds(breeds);
      setAvailableColors(colors);
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    } finally {
      setIsLoadingFilters(false);
    }
  }, []);

  // --- Funções de AsyncStorage ---
  const loadHistory = useCallback(async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Erro ao carregar histórico: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHistoryToStorage = useCallback(async (historyToSave: string[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(historyToSave));
    } catch (e) {
      console.error("Erro ao salvar histórico: ", e);
    }
  }, []);

  // Efeito para salvar o histórico sempre que ele mudar
  useEffect(() => {
    if (history.length > 0) {
      saveHistoryToStorage(history);
    }
  }, [history, saveHistoryToStorage]);

  const saveHistory = useCallback(async (updatedHistory: string[]) => {
    try {
      await saveHistoryToStorage(updatedHistory);
      setHistory(updatedHistory);
    } catch (e) {
      console.error("Erro ao salvar histórico: ", e);
    }
  }, [saveHistoryToStorage, setHistory]);

  useEffect(() => {
    loadHistory();
    loadFilterOptions();
  }, [loadHistory, loadFilterOptions]);

  // --- Funções de Ação ---

  const addSearchToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    setHistory(prevHistory => {
      const updatedHistory = [...prevHistory.filter(item => item !== cleanQuery)];
      updatedHistory.unshift(cleanQuery);
      return updatedHistory.slice(0, 5);
    });
  }, []);

  const removeSearchFromHistory = useCallback((itemToRemove: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item !== itemToRemove));
  }, []);

  const clearAllHistory = useCallback(() => {
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja apagar todo o seu histórico de pesquisa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => saveHistory([]),
        },
      ]
    );
  }, [saveHistory]);

  type QueryOperator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
  type QueryCondition = {
    field: string;
    operator: QueryOperator;
    value: any;
  };

  const handleSearchWithFilters = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Get all pets first
      const allPets = await queryDocuments('pets', []);
      
      // Filter pets based on search query and filters
      const filteredPets = allPets.filter(pet => {
        // Prepare searchable text from pet data
        const searchableText = [
          pet.name?.toLowerCase() || '',
          pet.description?.toLowerCase() || '',
          pet.breed?.toLowerCase() || '',
          pet.color?.toLowerCase() || ''
        ].join(' ');
        
        // Split search query into terms and check if all terms exist in searchable text
        const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        const matchesSearch = searchTerms.every(term => searchableText.includes(term));
        
        // Check filters
        const matchesGender = !filters.gender || pet.gender === filters.gender;
        const matchesSize = !filters.size || pet.size === filters.size;
        const matchesVaccinated = filters.isVaccinated === null || pet.isVaccinated === filters.isVaccinated;
        const matchesNeutered = filters.isNeutered === null || pet.isNeutered === filters.isNeutered;
        const matchesBreed = !filters.breed || pet.breed === filters.breed;
        const matchesColor = !filters.color || pet.color === filters.color;
        
        return matchesSearch && matchesGender && matchesSize && 
               matchesVaccinated && matchesNeutered && 
               matchesBreed && matchesColor;
      });
      
      // Add search to history
      addSearchToHistory(searchQuery);

      // Navigate to results screen with filtered data
      router.push({
        pathname: '/results',
        params: { 
          searchQuery: searchQuery,
          filters: JSON.stringify(filters),
          results: JSON.stringify(results)
        },
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca. Tente novamente.');
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      handleSearchWithFilters().catch(error => {
        console.error('Search error:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao realizar a busca.');
      });
    }
  };

  const handleHistoryItemPress = (item: string) => {
    addSearchToHistory(item);
    router.push({
      pathname: '/results',
      params: { 
        searchQuery: item,
        filters: JSON.stringify(filters)
      },
    });
    setSearchQuery("");
  };

  // FUNÇÃO DE NAVEGAÇÃO CORRIGIDA
  const handleGoToHome = useCallback(() => {
    // ⭐ CORREÇÃO PRINCIPAL: Usa router.replace('/homeScreen')
    // Isso garante que você volte para a rota raiz (Home) da sua Tab Bar
    // e remove a tela de pesquisa da pilha.
    // Se o seu arquivo home for 'index.tsx', mude para router.replace('/');
    router.replace("/homeScreen");
  }, [router]);

  // ⭐ NOVA FUNÇÃO: Handle do botão de voltar do sistema
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoToHome();
        return true; // Previne o comportamento padrão
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [handleGoToHome])
  );

  // =========================================================================
  // 2. RENDERIZAÇÃO
  // =========================================================================

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}
    >
      <Ionicons
        name="arrow-back-outline"
        size={20}
        color="#888"
        style={styles.historyIcon}
      />
      <Text style={styles.historyText} numberOfLines={1}>
        {item}
      </Text>
      <TouchableOpacity
        onPress={() => removeSearchFromHistory(item)}
        style={styles.removeButton}
      >
        <Ionicons name="close-outline" size={20} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ------------------ CABEÇALHO DE PESQUISA ------------------ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoToHome} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#333"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={true}
          />
        </View>
      </View>

      {/* ------------------ BOTÃO DE FILTROS ------------------ */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          disabled={isLoadingFilters}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={showFilters ? '#FFC837' : '#333'} 
          />
          <Text style={[styles.filterButtonText, showFilters && { color: '#FFC837' }]}>
            Filtros {isLoadingFilters ? '...' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ------------------ PAINEL DE FILTROS ------------------ */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {isLoadingFilters ? (
            <ActivityIndicator size="small" color="#FFC837" />
          ) : (
            <>
              {/* Filtro de Gênero */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Gênero</Text>
                <View style={styles.filterOptions}>
                  {['Macho', 'Fêmea'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.filterOption,
                        filters.gender === gender && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        gender: prev.gender === gender ? null : gender as 'Macho' | 'Fêmea'
                      }))}
                    >
                      <Text style={filters.gender === gender ? styles.filterOptionTextSelected : styles.filterOptionText}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Porte */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Porte</Text>
                <View style={styles.filterOptions}>
                  {['pequeno', 'médio', 'grande'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.filterOption,
                        filters.size === size && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        size: prev.size === size ? null : size as 'pequeno' | 'médio' | 'grande'
                      }))}
                    >
                      <Text style={filters.size === size ? styles.filterOptionTextSelected : styles.filterOptionText}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Vacinação */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Vacinado</Text>
                <View style={styles.filterOptions}>
                  {[true, false].map((value) => (
                    <TouchableOpacity
                      key={String(value)}
                      style={[
                        styles.filterOption,
                        filters.isVaccinated === value && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        isVaccinated: prev.isVaccinated === value ? null : value
                      }))}
                    >
                      <Text style={filters.isVaccinated === value ? styles.filterOptionTextSelected : styles.filterOptionText}>
                        {value ? 'Sim' : 'Não'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Castração */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Castrado</Text>
                <View style={styles.filterOptions}>
                  {[true, false].map((value) => (
                    <TouchableOpacity
                      key={String(value)}
                      style={[
                        styles.filterOption,
                        filters.isNeutered === value && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        isNeutered: prev.isNeutered === value ? null : value
                      }))}
                    >
                      <Text style={filters.isNeutered === value ? styles.filterOptionTextSelected : styles.filterOptionText}>
                        {value ? 'Sim' : 'Não'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Raça */}
              {availableBreeds.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Raça</Text>
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar raça..."
                      placeholderTextColor="#888"
                      value={filters.breed}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, breed: text }))}
                    />
                  </View>
                  <ScrollView style={styles.breedList}>
                    {availableBreeds
                      .filter(breed => 
                        breed.toLowerCase().includes(filters.breed.toLowerCase())
                      )
                      .map((breed) => (
                        <TouchableOpacity
                          key={breed}
                          style={styles.breedItem}
                          onPress={() => setFilters(prev => ({ ...prev, breed }))}
                        >
                          <Text style={styles.breedText}>{breed}</Text>
                          {filters.breed === breed && (
                            <Ionicons name="checkmark" size={20} color="#FFC837" />
                          )}
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}

              {/* Filtro de Cor */}
              {availableColors.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Cor</Text>
                  <View style={styles.colorOptions}>
                    {availableColors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color.toLowerCase() },
                          filters.color === color && styles.colorOptionSelected
                        ]}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          color: prev.color === color ? '' : color
                        }))}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Botões de ação dos filtros */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={[styles.filterActionButton, styles.clearFilterButton]}
                  onPress={() => setFilters({
                    gender: null,
                    size: null,
                    isVaccinated: null,
                    isNeutered: null,
                    breed: '',
                    color: '',
                  })}
                >
                  <Text style={styles.clearFilterButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterActionButton, styles.applyFilterButton]}
                  onPress={() => {
                    setShowFilters(false);
                    handleSearchWithFilters();
                  }}
                >
                  <Text style={styles.applyFilterButtonText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* ------------------ HISTÓRICO DE PESQUISAS ------------------ */}
      {isLoading || isLoadingFilters ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FFC837" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <View style={styles.historyContainer}>
          {history.length > 0 && (
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Últimas Pesquisas</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={styles.clearHistoryButtonText}>Limpar Tudo</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </SafeAreaView>
  );

};

export default SearchScreen;