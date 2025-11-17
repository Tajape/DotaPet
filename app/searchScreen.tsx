import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar a lista de pesquisas
const SEARCH_HISTORY_KEY = '@SearchHistory';
const MAX_HISTORY_ITEMS = 5; 

// =========================================================================
// 1. LÓGICA E GERENCIAMENTO
// =========================================================================

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Funções de AsyncStorage (Mantidas) ---
  const loadHistory = useCallback(async () => {
    // ... (Mantida a lógica de carregar histórico)
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

  const saveHistory = async (updatedHistory: string[]) => {
    // ... (Mantida a lógica de salvar histórico)
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (e) {
      console.error("Erro ao salvar histórico: ", e);
    }
  };

  const addSearchToHistory = (query: string) => {
    // ... (Mantida a lógica de adicionar ao histórico)
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    let updatedHistory = history.filter(item => item !== cleanQuery);
    updatedHistory.unshift(cleanQuery);
    updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    saveHistory(updatedHistory);
  };
  
  const removeSearchFromHistory = (itemToRemove: string) => {
    // ... (Mantida a lógica de remover do histórico)
    const updatedHistory = history.filter(item => item !== itemToRemove);
    saveHistory(updatedHistory);
  };

  const clearAllHistory = () => {
    // ... (Mantida a lógica de limpar todo o histórico)
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja apagar todo o seu histórico de pesquisa?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpar", 
          style: "destructive", 
          onPress: () => saveHistory([])
        },
      ]
    );
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // --- Funções de Ação ---

  const handleSearchSubmit = () => {
    // É chamado quando o usuário aperta ENTER ou o botão de filtro
    if (searchQuery.trim()) {
      addSearchToHistory(searchQuery); 
      
      // >>> NAVEGAÇÃO PARA RESULTADOS APÓS PESQUISA MANUAL <<<
      router.push({ 
        pathname: '/results', 
        params: { q: searchQuery } 
      } as never);
    }
  };
  
  // >>> FUNÇÃO CORRIGIDA: NAVEGAÇÃO AO CLICAR NO HISTÓRICO <<<
  const handleHistoryItemPress = (item: string) => {
    // 1. Garante que o item clicado vá para o topo do histórico
    addSearchToHistory(item); 
    
    // 2. Navega usando o item clicado como parâmetro de busca
    router.push({ 
        pathname: '/results', 
        params: { q: item } 
    } as never);
    
    // 3. Opcional: Limpa o campo de input após navegar
    setSearchQuery(''); 
  };


// =========================================================================
// 2. RENDERIZAÇÃO
// =========================================================================

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => handleHistoryItemPress(item)} // CHAMA A NOVA FUNÇÃO AQUI
    >
      {/* Ícone de "re-executar" a pesquisa */}
      <Ionicons name="arrow-back-outline" size={20} color="#888" style={styles.historyIcon} />
      <Text style={styles.historyText} numberOfLines={1}>{item}</Text>
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
      
      {/* Esconde o header padrão */}
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          presentation: 'modal', 
        }} 
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* ------------------ CABEÇALHO DE PESQUISA ------------------ */}
      <View style={styles.header}>
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        {/* Barra de Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#333" 
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit} // Dispara a busca
            returnKeyType="search"
            autoFocus={true} 
          />
          {/* Ícone de Filtro */}
          <TouchableOpacity onPress={handleSearchSubmit} style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ------------------ HISTÓRICO DE PESQUISAS ------------------ */}
      {isLoading ? (
        <Text style={styles.loadingText}>Carregando Histórico...</Text>
      ) : (
        <View style={styles.historyListContainer}>
          {history.length > 0 && (
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Últimas Pesquisas</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={styles.clearButtonText}>Limpar Tudo</Text>
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

// =========================================================================
// 3. ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 0, 
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3', 
    borderRadius: 8, 
    height: 48,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 0, 
    height: '100%',
  },
  filterButton: {
    marginLeft: 10,
    padding: 2,
  },
  historyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#999',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  historyIcon: {
    marginRight: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    paddingLeft: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  }
});

export default SearchScreen;