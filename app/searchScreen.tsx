import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Constantes
const SEARCH_HISTORY_KEY = "@SearchHistory";
const MAX_HISTORY_ITEMS = 5;

// =========================================================================
// 1. COMPONENTE PRINCIPAL (SearchScreen)
// =========================================================================

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const saveHistory = async (updatedHistory: string[]) => {
    try {
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
      setHistory(updatedHistory);
    } catch (e) {
      console.error("Erro ao salvar histórico: ", e);
    }
  };

  const addSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    let updatedHistory = history.filter((item) => item !== cleanQuery);
    updatedHistory.unshift(cleanQuery);
    updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    saveHistory(updatedHistory);
  };

  const removeSearchFromHistory = (itemToRemove: string) => {
    const updatedHistory = history.filter((item) => item !== itemToRemove);
    saveHistory(updatedHistory);
  };

  const clearAllHistory = () => {
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
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // --- Funções de Ação ---

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearchToHistory(searchQuery);
      router.push({
        pathname: "/results",
        params: { q: searchQuery },
      } as never);
    }
  };

  const handleHistoryItemPress = (item: string) => {
    addSearchToHistory(item);
    router.push({
      pathname: "/results",
      params: { q: item },
    } as never);
    setSearchQuery("");
  };

  // FUNÇÃO DE NAVEGAÇÃO CORRIGIDA
  const handleGoToHome = () => {
    // ⭐ CORREÇÃO PRINCIPAL: Usa router.replace('/homeScreen')
    // Isso garante que você volte para a rota raiz (Home) da sua Tab Bar
    // e remove a tela de pesquisa da pilha.
    // Se o seu arquivo home for 'index.tsx', mude para router.replace('/');
    router.replace("/homeScreen");
  };

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
    }, [])
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
          // ⭐ REMOVIDO: presentation: 'modal'
          gestureEnabled: true,
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ------------------ CABEÇALHO DE PESQUISA ------------------ */}
      <View style={styles.header}>
        {/* ⭐ Ação de Voltar para a Home ⭐ */}
        <TouchableOpacity onPress={handleGoToHome} style={styles.backButton}>
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
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={true}
          />
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 5 : 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#333",
    paddingVertical: 0,
    paddingHorizontal: 15,
    height: "100%",
  },
  historyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#999",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  historyIcon: {
    marginRight: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    paddingLeft: 10,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
  },
});

export default SearchScreen;