import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDocument, queryDocuments } from "../firebase";
import { getCurrentUser } from "../services/authService";

// ⭐️ NOVO: Importa a função do serviço de favoritos
import {
  isPetFavorited,
  toggleFavorite as toggleFavoriteService,
} from "../services/favoritesService";

// Definição de tipos para as props do componente TabItem
interface TabItemProps {
  name: string;
  label: string;
  route: string;
  isFocused: boolean;
}

// Dados de perfil simulados para fallback
const MOCK_USER_PROFILE = {
  imageUri: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU",
  username: "SeuUsuário",
};

// Tipagem simples para perfil
interface UserProfile {
  username?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  profileImage?: string | null;
}

// Função para calcular dimensões responsivas
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 667) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Estilos (MANTIDOS IGUAIS)
const createResponsiveStyles = () =>
  StyleSheet.create({
    // --- Estrutura Básica ---
    safeArea: {
      flex: 1,
      backgroundColor: "#fff",
    },
    // O paddingBottom garante que o último conteúdo não fique atrás da nav bar
    scrollContent: {
      paddingBottom: verticalScale(80) + (Platform.OS === "ios" ? 20 : 0),
    },
    mainContent: {
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(8),
    },

    // --- Cabeçalho (Header) ---
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(15),
      paddingVertical: verticalScale(10),
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
      paddingTop:
        Platform.OS === "android"
          ? (StatusBar.currentHeight || 0) + verticalScale(10)
          : verticalScale(10),
    },
    profileButton: {
      marginRight: scale(10),
    },
    profileImage: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      borderWidth: 2,
      borderColor: "#FFC837",
    },

    // --- Barra de Pesquisa (Botão Visual) ---
    searchButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F3F3F3",
      borderRadius: scale(30),
      height: verticalScale(48),
      paddingHorizontal: scale(15),
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    searchIcon: {
      marginRight: scale(8),
    },
    searchPlaceholder: {
      fontSize: moderateScale(14),
      color: "#888",
      flexShrink: 1,
    },

    // --- Conteúdo Geral (Cards e Placeholder) ---
    placeholderCardContainer: {
      backgroundColor: "#FFFBEA",
      borderWidth: 2,
      borderColor: "#FFC837",
      borderStyle: "dashed",
      borderRadius: scale(15),
      padding: scale(20),
      alignItems: "center",
      justifyContent: "center",
      minHeight: verticalScale(200),
      textAlign: "center",
      marginTop: verticalScale(10),
    },
    placeholderText: {
      fontSize: moderateScale(14),
      color: "#333",
      textAlign: "center",
      marginBottom: verticalScale(5),
    },
    placeholderTextSmall: {
      fontSize: moderateScale(12),
      color: "#666",
      textAlign: "center",
    },
    cardWrapper: {
      marginBottom: verticalScale(16),
    },
    card: {
      borderRadius: scale(16),
      overflow: "hidden",
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.1,
      shadowRadius: scale(8),
      elevation: 4,
    },
    cardImage: {
      width: "100%",
      height: verticalScale(180),
      resizeMode: "cover",
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: scale(12),
      borderTopWidth: 1,
      borderTopColor: "#F0F0F0",
    },
    cardText: {
      flex: 1,
    },
    cardName: {
      fontSize: moderateScale(16),
      fontWeight: "800",
      color: "#111",
      marginBottom: verticalScale(2),
    },
    cardDescription: {
      fontSize: moderateScale(12),
      color: "#777",
    },
    cardAgeBadge: {
      backgroundColor: "#fff",
      borderRadius: scale(18),
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderWidth: 1,
      borderColor: "#eee",
      marginLeft: scale(8),
      alignSelf: "flex-start",
    },
    cardAgeText: {
      fontSize: moderateScale(12),
      fontWeight: "700",
      color: "#666",
    },
    favoriteButton: {
      position: "absolute",
      top: scale(12),
      right: scale(12),
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: scale(20),
      width: scale(36),
      height: scale(36),
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },

    // --- BARRA DE NAVEGAÇÃO (NAV BAR) ---
    tabBarContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "flex-start",
      backgroundColor: "#FFC837",
      height: verticalScale(75),
      paddingHorizontal: 0, // 👈 MANTIDO ZERADO
      paddingTop: verticalScale(8),
      borderTopLeftRadius: scale(30),
      borderTopRightRadius: scale(30),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -scale(5) },
      shadowOpacity: 0.15,
      shadowRadius: scale(10),
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
      paddingVertical: verticalScale(5),
      paddingHorizontal: scale(2), // 👈 ADICIONADO UM PEQUENO ESPAÇO INTERNO PARA OS ÍCONES
    },
    tabLabel: {
      fontSize: moderateScale(10),
      fontWeight: "500",
      color: "#666",
      marginTop: verticalScale(2),
    },
    tabLabelFocused: {
      color: "#333",
      fontWeight: "700",
    },

    // --- Botão Central de Adicionar ---
    addButton: {
      backgroundColor: "#fff",
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      justifyContent: "center",
      alignItems: "center",
      marginTop: -verticalScale(25),
      borderWidth: scale(4),
      borderColor: "#FFC837",
      shadowColor: "#333",
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.4,
      shadowRadius: scale(4),
      elevation: 8,
    },
  });

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

const HomeScreen = () => {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const currentRoute: string = "/homeScreen";
  const styles = createResponsiveStyles();

  // Carregar perfil e pets do usuário ao montar
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        return;
      }

      const profile = await getDocument("users", user.uid);
      if (profile) {
        setUserProfile(profile as UserProfile);
      }

      const allPets = await queryDocuments("pets", []);
      
      // 🚀 Passo 1 da Correção: Carregar o status de favorito para cada pet
      const petsWithFavorites = await Promise.all(
        allPets.map(async (pet: any) => ({
          ...pet,
          isFavorited: await isPetFavorited(pet.id),
        }))
      );
      setPets(petsWithFavorites);

    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Funções de Navegação (ROTAS COM /) ---
  const handleTabPress = (route: string) => {
    if (route === "/searchScreen") {
      router.replace("/searchScreen" as never);
    } else if (route === "/my-profile") {
      router.replace("/my-profile" as never);
    } else if (route === "/favorites") {
      // ⚠️ Use push ou replace dependendo do comportamento desejado
      router.replace("/favorites" as never);
    } else if (route === "/homeScreen") {
      router.replace("/homeScreen" as never);
    }
  };

  // Componente para renderizar cada card de pet
  const PetCard = ({ pet, index }: { pet: any; index: number }) => {
    // ⭐️ Passo 2 da Correção: Inicializa o estado com o valor carregado
    const [isFavorite, setIsFavorite] = useState(pet.isFavorited);

    const firstImage =
      Array.isArray(pet.images) &&
      pet.images.length > 0 &&
      typeof pet.images[0] === "string"
        ? pet.images[0]
        : typeof pet.image === "string"
        ? pet.image
        : MOCK_USER_PROFILE.imageUri;

    // 🚀 Passo 3 da Correção: Usa a função de serviço real para salvar
    const toggleFavorite = async (e: any) => {
      e.stopPropagation();
      
      try {
        // Chama a função do serviço para adicionar/remover do Firebase
        const newStatus = await toggleFavoriteService(pet.id);
        
        // Atualiza o estado local APENAS se a chamada do serviço for bem-sucedida
        setIsFavorite(newStatus); 
        
        // O `FavoritesScreen` irá recarregar automaticamente graças ao useFocusEffect
        // na próxima vez que for acessado.
      } catch (error) {
        console.error("Erro ao favoritar/desfavoritar:", error);
      }
    };

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => {
          // Rota para a tela de detalhes do pet
          router.push(`/pets/${pet.id}` as never);
        }}
      >
        <View style={styles.card}>
          <Image source={{ uri: firstImage }} style={styles.cardImage} />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "#FF3B30" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{pet.name || "Sem nome"}</Text>
              <Text numberOfLines={2} style={styles.cardDescription}>
                {pet.description || pet.details || ""}
              </Text>
            </View>
            <View style={styles.cardAgeBadge}>
              <Text style={styles.cardAgeText}>{pet.age || ""}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- Componente TabItem ---
  const TabItem: React.FC<TabItemProps> = ({
    name,
    label,
    route,
    isFocused,
  }) => (
    <TouchableOpacity
      key={route}
      style={styles.tabItem}
      onPress={() => handleTabPress(route)}
      disabled={isFocused}
    >
      <Ionicons
        name={
          isFocused
            ? (name.replace("-outline", "") as "home")
            : (name as "home-outline")
        }
        size={24}
        color={isFocused ? "#333" : "#666"}
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{ headerShown: false, animation: "none" as const }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => handleTabPress("/my-profile")}
          style={styles.profileButton}
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri: userProfile?.profileImage || MOCK_USER_PROFILE.imageUri,
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleTabPress("/searchScreen")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>
            Pesquisar por nome, raça ou localização...
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.mainContent, { marginTop: 15 }]}>
          {isLoading ? (
            <View style={styles.placeholderCardContainer}>
              <Ionicons
                name="timer"
                size={36}
                color="#FFC837"
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.placeholderText}>Carregando...</Text>
            </View>
          ) : pets && pets.length > 0 ? (
            <View>
              {pets.map((pet, idx) => (
                <PetCard key={pet.id || idx} pet={pet} index={idx} />
              ))}
            </View>
          ) : (
            <View style={styles.placeholderCardContainer}>
              <Ionicons
                name="paw"
                size={40}
                color="#FFC837"
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.placeholderText}>Nenhum pet disponível!</Text>
              <Text style={styles.placeholderTextSmall}>
                Toque no botão + para adicionar seu primeiro pet.
              </Text>
            </View>
          )}

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* --- BARRA DE NAVEGAÇÃO (AJUSTADA) --- */}
      <View style={styles.tabBarContainer}>
        <TabItem
          name="home-outline"
          label="Início"
          route="/homeScreen"
          isFocused={currentRoute === "/homeScreen"}
        />

        <TabItem
          name="search-outline"
          label="Pesquisar"
          route="/searchScreen"
          isFocused={currentRoute === "/searchScreen"}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/register-pet" as any)}
        >
          <Ionicons name="add" size={32} color="#333" />
        </TouchableOpacity>

        <TabItem
          name="heart-outline"
          label="Favoritos"
          route="/favorites"
          isFocused={currentRoute === "/favorites"}
        />

        <TabItem
          name="person-outline"
          label="Perfil"
          route="/my-profile"
          isFocused={currentRoute === "/my-profile"}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;