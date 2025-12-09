import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
// import { queryDocuments } from "../firebase"; // Não é mais necessário para filtros
import { ms as moderateScale, hs as scale, vs as verticalScale } from "./utils/responsive";

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(15),
        paddingBottom: scale(10),
        paddingTop:
            Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + scale(10)
                : scale(10),
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },

    // Search
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: scale(10),
        paddingHorizontal: scale(15),
        height: verticalScale(50),
    },
    searchInput: {
        flex: 1,
        fontSize: moderateScale(16),
        color: "#333",
        padding: 0,
        marginLeft: scale(10),
    },
    // searchIcon: { // Este estilo não é mais usado no searchContainer, mas mantido por precaução se estivesse em uso
    //     marginRight: 10,
    // },
    // searchInputContainer: { // Não é mais usado
    //     flexDirection: "row",
    //     alignItems: "center",
    //     backgroundColor: "#f5f5f5",
    //     borderRadius: 10,
    //     paddingHorizontal: 15,
    //     height: 50,
    //     marginBottom: 10,
    // },

    // History
    historyContainer: {
        flex: 1,
        padding: 15,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    clearButton: {
        padding: 5,
    },
    clearButtonText: {
        color: "#4a90e2",
        fontSize: 14,
    },
    clearHistoryButtonText: {
        color: "#FF3B30",
        fontSize: 14,
        fontWeight: "500",
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f5f5f5",
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
        color: "#333",
    },

    // Empty/Loading States
    // emptyHistory: { // Não é mais usado
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     padding: 20,
    // },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#888",
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

    // ⭐ REMOVIDOS: Todos os estados relacionados a filtros (PetFilters, filters, availableBreeds, availableColors, showFilters, isLoadingFilters)

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
            await AsyncStorage.setItem(
                SEARCH_HISTORY_KEY,
                JSON.stringify(historyToSave)
            );
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

    const saveHistory = useCallback(
        async (updatedHistory: string[]) => {
            try {
                await saveHistoryToStorage(updatedHistory);
                setHistory(updatedHistory);
            } catch (e) {
                console.error("Erro ao salvar histórico: ", e);
            }
        },
        [saveHistoryToStorage, setHistory]
    );

    useEffect(() => {
        loadHistory();
        // ⭐ REMOVIDO: loadFilterOptions()
    }, [loadHistory]);

    // --- Funções de Ação ---

    const addSearchToHistory = useCallback((query: string) => {
        if (!query.trim()) return;
        const cleanQuery = query.trim();
        setHistory((prevHistory) => {
            const updatedHistory = [
                ...prevHistory.filter((item) => item !== cleanQuery),
            ];
            updatedHistory.unshift(cleanQuery);
            return updatedHistory.slice(0, 5);
        });
    }, []);

    const removeSearchFromHistory = useCallback((itemToRemove: string) => {
        setHistory((prevHistory) =>
            prevHistory.filter((item) => item !== itemToRemove)
        );
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

    // ⭐ REMOVIDAS: QueryOperator e QueryCondition

    const handleSearchExecution = async (query: string) => { // Renomeado para refletir a busca pura
        if (!query.trim()) return;

        try {
            // Navega para a tela de resultados passando apenas a query
            addSearchToHistory(query);

            router.push({
                pathname: "results",
                params: {
                    searchQuery: query,
                    // ⭐ REMOVIDO: filters: JSON.stringify(filters),
                    // ⭐ REMOVIDO: results (não é necessário)
                },
            });
        } catch (error) {
            console.error("Erro na busca:", error);
            Alert.alert(
                "Erro",
                "Não foi possível realizar a busca. Tente novamente."
            );
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            handleSearchExecution(searchQuery).catch((error) => {
                console.error("Search error:", error);
                Alert.alert("Erro", "Ocorreu um erro ao realizar a busca.");
            });
        }
    };

    const handleHistoryItemPress = (item: string) => {
        // Usa o item do histórico para executar a busca
        handleSearchExecution(item).catch((error) => {
            console.error("History search error:", error);
            Alert.alert("Erro", "Ocorreu um erro ao buscar pelo histórico.");
        });
        setSearchQuery(""); // Limpa o campo após a busca
    };

    // FUNÇÃO DE NAVEGAÇÃO CORRIGIDA
    const handleGoToHome = useCallback(() => {
        // ⭐ CORREÇÃO PRINCIPAL: Usa router.replace('homeScreen')
        router.replace("homeScreen");
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

            {/* ⭐ REMOVIDO: BOTÃO DE FILTROS */}
            {/* ⭐ REMOVIDO: PAINEL DE FILTROS */}

            {/* ------------------ HISTÓRICO DE PESQUISAS ------------------ */}
            {isLoading ? ( // isLoadingFilters também foi removido daqui
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