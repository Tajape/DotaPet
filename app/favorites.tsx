import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getFavoritePets, toggleFavorite } from "../services/favoritesService";

// =========================================================================
// Componente auxiliar para a Tab Bar
// =========================================================================

interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isFocused: boolean;
  onPress: (route: string) => void;
}

const TabItem: React.FC<TabItemProps> = ({
  name,
  label,
  route,
  isFocused,
  onPress,
}) => {
  const styles = StyleSheet.create({
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 5,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "500",
      color: "#666",
      marginTop: 2,
    },
    tabLabelFocused: {
      color: "#333",
      fontWeight: "700",
    },
  });

  return (
    <TouchableOpacity
      key={route}
      style={styles.tabItem}
      onPress={() => onPress(route)}
    >
      <Ionicons
        name={
          isFocused
            ? (name.replace("-outline", "") as "heart")
            : (name as "heart-outline")
        }
        size={24}
        color={isFocused ? "#333" : "#666"}
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// =========================================================================
// COMPONENTE PRINCIPAL (FavoritesScreen)
// =========================================================================

interface Pet {
  id: string;
  name?: string;
  description?: string;
  images?: string[];
  type?: "cat" | "dog";
  breed?: string;
}

const useResponsiveSize = () => {
  const { width } = useWindowDimensions();

  return (size: number) => {
    const scale = Math.min(width, 600) / 375; // 375 é a largura base (iPhone 6/7/8)
    return Math.round(size * scale);
  };
};

const FavoritesScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const responsiveSize = useResponsiveSize();
  const isLargeScreen = width > 600;
  const insets = useSafeAreaInsets();

  const currentRoute: string = "favorites";
  const [refreshing, setRefreshing] = useState(false);
  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const pets = await getFavoritePets();
      setFavoritePets(pets);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
  };

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleGoBack = useCallback(() => {
    // Garante que o usuário volte para a Home
    router.replace("homeScreen" as never);
  }, [router]);

  // ⭐ NOVO: Handle do botão de voltar do sistema
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // Previne o comportamento padrão
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [handleGoBack]) // Adicionado handleGoBack ao array de dependências
  );

  const handleTabPress = (route: string) => {
    if (route === currentRoute) {
      return;
    }

    if (route === "register-pet") {
      router.push("register-pet" as never);
    } else {
      router.replace(route as never);
    }
  };

  const screenOptions = {
    headerShown: false,
    animation: "none" as const,
  };

  const handleRemoveFavorite = async (petId: string) => {
    try {
      await toggleFavorite(petId);
      // Atualizar a lista removendo o pet desfavoritado
      setFavoritePets((prev) => prev.filter((pet) => pet.id !== petId));
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
  };

  const renderPetCard = (pet: Pet) => {
    const firstImage =
      Array.isArray(pet.images) &&
      pet.images.length > 0 &&
      typeof pet.images[0] === "string"
        ? pet.images[0]
        : "https://placehold.co/400x300/CCCCCC/999999?text=Sem+Imagem";

    return (
      <View key={pet.id} style={styles.petCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/pets/${pet.id}` as never)}
        >
          <Image
            source={{ uri: firstImage }}
            style={styles.petImage}
            resizeMode="cover"
          />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name || "Sem Nome"}</Text>
            <Text style={styles.petBreed} numberOfLines={1}>
              {pet.breed || "Raça não informada"}
            </Text>
            {pet.description && (
              <Text style={styles.petDescription} numberOfLines={2}>
                {pet.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(pet.id)}
        >
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Opss... Parece que você ainda não adicionou nenhum pet...😢
      </Text>
      <Ionicons name="paw" size={120} color="#ccc" style={styles.emptyIcon} />
      <Text style={styles.emptySubText}>
        Clique no coração (♡) ao lado dos pets que você gostar na tela inicial
        para vê-los aqui.
      </Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      );
    }

    if (favoritePets.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.petsContainer}>
        {favoritePets.map(renderPetCard)}
      </View>
    );
  };

  // Obter estilos responsivos
  const styles = getStyles(responsiveSize, isLargeScreen, insets.bottom || 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Adicionando um container para limitar a largura máxima em telas grandes */}
      <View style={styles.maxWidthContainer}>
        <Stack.Screen options={screenOptions} />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* ------------------ 1. CABEÇALHO ------------------ */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>

        {/* ------------------ 2. CONTEÚDO PRINCIPAL ------------------ */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderContent()}
        </ScrollView>

        {/* ------------------ 3. BARRA DE NAVEGAÇÃO INFERIOR ------------------ */}
        <View style={styles.tabBarContainer}>
          <TabItem
            name="home-outline"
            label="Início"
            route="homeScreen"
            isFocused={currentRoute === "homeScreen"}
            onPress={handleTabPress}
          />
          <TabItem
            name="search-outline"
            label="Pesquisar"
            route="searchScreen"
            isFocused={currentRoute === "searchScreen"}
            onPress={handleTabPress}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/register-pet" as never)}
          >
            <Ionicons name="add" size={32} color="#333" />
          </TouchableOpacity>

          <TabItem
            name="heart-outline"
            label="Favoritos"
            route="favorites"
            isFocused={currentRoute === "favorites"}
            onPress={handleTabPress}
          />

          <TabItem
            name="person-outline"
            label="Perfil"
            route="my-profile"
            isFocused={currentRoute === "my-profile"}
            onPress={handleTabPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILOS
// =========================================================================

const getStyles = (
  responsiveSize: (size: number) => number,
  isLargeScreen: boolean,
  bottomInset: number
) => {
  const basePadding = isLargeScreen ? 30 : 15;
  const cardWidth = isLargeScreen ? "48%" : "100%";
  const cardMargin = isLargeScreen ? "1%" : 0;

  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    petsContainer: {
      flexDirection: isLargeScreen ? "row" : "column",
      flexWrap: isLargeScreen ? "wrap" : "nowrap",
      width: "100%",
      paddingHorizontal: responsiveSize(8),
      paddingBottom: responsiveSize(80) + bottomInset, // alinhado com homeScreen
      justifyContent: isLargeScreen ? "space-between" : "flex-start",
    },
    petCard: {
      flexDirection: isLargeScreen ? "column" : "row",
      backgroundColor: "#fff",
      borderRadius: responsiveSize(12),
      marginBottom: responsiveSize(15),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
      width: cardWidth,
      marginHorizontal: cardMargin,
      maxWidth: isLargeScreen ? 300 : "100%",
    },
    cardContent: {
      flex: 1,
      flexDirection: isLargeScreen ? "column" : "row",
    },
    petImage: {
      width: isLargeScreen ? "100%" : responsiveSize(120),
      height: isLargeScreen ? responsiveSize(180) : responsiveSize(120),
      backgroundColor: "#f0f0f0",
      minHeight: isLargeScreen ? responsiveSize(180) : responsiveSize(120),
    },
    petInfo: {
      flex: 1,
      padding: responsiveSize(12),
      justifyContent: "center",
    },
    petName: {
      fontSize: responsiveSize(18),
      fontWeight: "bold",
      color: "#333",
    },
    petBreed: {
      fontSize: responsiveSize(14),
      color: "#666",
      marginBottom: responsiveSize(6),
    },
    petDescription: {
      fontSize: responsiveSize(13),
      color: "#777",
      lineHeight: responsiveSize(18),
    },
    favoriteButton: {
      position: "absolute",
      top: responsiveSize(10),
      right: responsiveSize(10),
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: responsiveSize(20),
      width: responsiveSize(40),
      height: responsiveSize(40),
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    // --- Estrutura Básica ---
    safeArea: {
      flex: 1,
      backgroundColor: "#fff",
    },
    maxWidthContainer: {
      flex: 1,
      width: "100%",
      maxWidth: 1200, // Aumentado para telas maiores
      alignSelf: "center",
    },
    // Garante que o scroll content ocupe o espaço para centralizar o estado vazio
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: responsiveSize(12),
      paddingBottom: responsiveSize(80) + bottomInset, // alinhado com homeScreen
      width: "100%",
      maxWidth: "100%",
    },

    // --- 1. Cabeçalho Personalizado ---
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsiveSize(15),
      paddingVertical: responsiveSize(15),
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingTop:
        Platform.OS === "android"
          ? (StatusBar.currentHeight || 0) + 5
          : responsiveSize(15),
    },
    backButton: {
      padding: responsiveSize(5),
      marginRight: responsiveSize(15),
    },
    headerTitle: {
      fontSize: responsiveSize(24),
      fontWeight: "700",
      color: "#333",
    },

    // --- 2. Estado Vazio (Empty State) - AJUSTADO PARA ALINHAMENTO ---
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      paddingVertical: responsiveSize(40),
      paddingHorizontal: responsiveSize(20),
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
    },
    emptyText: {
      fontSize: responsiveSize(18),
      fontWeight: "600",
      color: "#666",
      lineHeight: responsiveSize(26),
      textAlign: "center",
      marginBottom: responsiveSize(12),
      paddingHorizontal: responsiveSize(10),
    },
    emptyIcon: {
      marginVertical: responsiveSize(8),
      opacity: 0.7,
      fontSize: responsiveSize(80),
    },
    emptySubText: {
      fontSize: responsiveSize(13),
      color: "#999",
      textAlign: "center",
      marginTop: responsiveSize(6),
      paddingHorizontal: responsiveSize(15),
      maxWidth: 400,
    },

    // --- 3. Bottom Tab Bar (Mantida Consistente) ---
    tabBarContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "flex-start",
      backgroundColor: "#FFC837",
      height: responsiveSize(75),
      paddingHorizontal: 0, // 👈 ZERADO PARA OCUPAR LARGURA TOTAL
      paddingTop: responsiveSize(8),
      borderTopLeftRadius: responsiveSize(30),
      borderTopRightRadius: responsiveSize(30),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -responsiveSize(5) },
      shadowOpacity: 0.15,
      shadowRadius: responsiveSize(10),
      elevation: 10,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: responsiveSize(5),
      paddingHorizontal: responsiveSize(2), // 👈 PEQUENO ESPAÇO INTERNO
    },
    tabLabel: {
      fontSize: responsiveSize(11),
      fontWeight: "500",
      color: "#666",
      marginTop: responsiveSize(2),
    },
    tabLabelFocused: {
      color: "#333",
      fontWeight: "700",
    },
    addButton: {
      backgroundColor: "#fff",
      width: responsiveSize(60),
      height: responsiveSize(60),
      borderRadius: responsiveSize(30),
      justifyContent: "center",
      alignItems: "center",
      marginTop: responsiveSize(-25),
      borderWidth: responsiveSize(4),
      borderColor: "#FFC837",
      shadowColor: "#333",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 6,
    },
  });
};

export default FavoritesScreen;
