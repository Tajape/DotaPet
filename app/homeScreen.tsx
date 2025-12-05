import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { isPetFavorited, toggleFavorite } from "../services/favoritesService";
import { ms as moderateScale, hs as scale, vs as verticalScale } from "./utils/responsive";

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

// Estilos
const createResponsiveStyles = () =>
  StyleSheet.create({
    // --- Estrutura Básica ---
    safeArea: {
      flex: 1,
      backgroundColor: "#fff",
    },
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
      backgroundColor: "#F5F5F5",
      borderRadius: scale(10),
      height: verticalScale(40),
      paddingHorizontal: scale(15),
      marginHorizontal: scale(16),
      marginVertical: scale(8),
    },
    searchIcon: {
      marginRight: scale(8),
      color: "#666",
    },
    searchPlaceholder: {
      fontSize: moderateScale(14),
      color: "#999",
      flexShrink: 1,
      fontFamily: 'System',
    },

    // --- Título de Seção ---
    sectionTitle: {
      fontSize: moderateScale(20),
      fontWeight: "700",
      color: "#333",
      marginTop: verticalScale(25),
      marginBottom: verticalScale(15),
    },

    // --- Placeholder Card (Revertido) ---
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
    // --- Card de Pet ---
    petCard: {
      backgroundColor: "#fff",
      borderRadius: scale(15),
      marginBottom: scale(16),
      overflow: "hidden",
      marginHorizontal: scale(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    petImage: {
      width: "100%",
      height: verticalScale(180),
      backgroundColor: "#F0F0F0",
    },
    petInfo: {
      padding: scale(12),
      flexDirection: "row",
      alignItems: "center",
    },
    petTextContainer: {
      flex: 1,
    },
    petName: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: "#333",
      marginBottom: scale(2),
    },
    petDetails: {
      fontSize: moderateScale(12),
      color: "#666",
      marginBottom: 0,
    },
    petAgeBadge: {
      backgroundColor: "#fff",
      borderRadius: scale(12),
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderWidth: 1,
      borderColor: "#E0E0E0",
      marginLeft: scale(8),
    },
    petAgeText: {
      fontSize: moderateScale(12),
      fontWeight: "700",
      color: "#666",
    },
    // --- Novo estilo para cards (estilo semelhante ao anexo)
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
    // --- Bottom Tab Bar ---
    tabBarContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "#FFC837",
      height: verticalScale(70),
      paddingHorizontal: scale(5),
      borderTopLeftRadius: scale(20),
      borderTopRightRadius: scale(20),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
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
      paddingVertical: verticalScale(8),
      height: "100%",
    },
    tabIcon: {
      marginBottom: scale(4),
    },
    tabLabel: {
      fontSize: moderateScale(10),
      fontWeight: "500",
      color: "#666",
      marginTop: verticalScale(2),
    },
    tabLabelFocused: {
      color: "#000",
      fontWeight: "700",
    },

    // --- Botão Central de Adicionar ---
    addButton: {
      backgroundColor: "#fff",
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      justifyContent: "center",
      alignItems: "center",
      marginTop: -verticalScale(20),
      borderWidth: scale(3),
      borderColor: "#FFC837",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
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
  // 🔧 CORREÇÃO: currentRoute agora é /homeScreen (não /(tabs))
  const currentRoute: string = "/homeScreen";
  const styles = createResponsiveStyles();

  // Carregar perfil e pets do usuário ao montar
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log("❌ Usuário não autenticado");
        return;
      }

      // 🔧 ADICIONAR LOG
      console.log("📱 Carregando dados do usuário:", user.uid);

      // Carregar perfil salvo no Firestore
      const profile = await getDocument("users", user.uid);
      if (profile) {
        console.log("✅ Perfil carregado:", profile);
        setUserProfile(profile as UserProfile);
      } else {
        console.warn("⚠️ Perfil não encontrado");
      }

      // Carregar TODOS os pets de todos os usuários
      const allPets = await queryDocuments("pets", []);
      console.log("✅ Pets carregados:", allPets.length);
      setPets(allPets);
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

  // --- Funções de Navegação ---
  const handleTabPress = (route: string) => {
    console.log("🔗 Navegando para:", route);

    if (route === "/register-pet") {
      router.push("/register-pet" as never);
    } else if (route === "/searchScreen") {
      router.replace("/searchScreen" as never);
    } else if (route === "/my-profile") {
      router.replace("/my-profile" as never);
    } else if (route === "/favorites") {
      router.replace("/favorites" as never);
    } else if (route === "/homeScreen") {
      router.replace("/homeScreen" as never);
    }
  };

  // Componente para renderizar cada card de pet
  const PetCard = ({ pet, index }: { pet: any; index: number }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    // 🔧 GARANTIR QUE firstImage É STRING
    const firstImage =
      Array.isArray(pet.images) &&
      pet.images.length > 0 &&
      typeof pet.images[0] === "string"
        ? pet.images[0]
        : typeof pet.image === "string"
        ? pet.image
        : MOCK_USER_PROFILE.imageUri;

    React.useEffect(() => {
      const loadFavoriteState = async () => {
        try {
          if (!pet.id) return;
          const favorited = await isPetFavorited(pet.id);
          setIsFavorite(favorited);
        } catch (error) {
          console.error("Erro ao verificar favorito:", error);
        }
      };

      loadFavoriteState();
    }, [pet.id]);

    const handleToggleFavorite = async (e: any) => {
      e.stopPropagation();

      if (!pet.id || isToggling) return;

      try {
        setIsToggling(true);
        const favorited = await toggleFavorite(pet.id);
        setIsFavorite(favorited);
      } catch (error) {
        console.error("Erro ao alternar favorito:", error);
      } finally {
        setIsToggling(false);
      }
    };

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => {
          console.log("🔗 Abrindo pet:", pet.id);
          router.push(`/pets/${pet.id}` as never);
        }}
      >
        <View style={styles.card}>
          <Image source={{ uri: firstImage }} style={styles.cardImage} />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
            disabled={isToggling}
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
  const TabItem = ({ name, label, route, isFocused }: TabItemProps) => {
    return (
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress(route)}
        activeOpacity={0.7}
        disabled={isFocused}
      >
        <Ionicons
          name={name as any}
          size={24}
          color={isFocused ? "#000" : "#666"}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabLabel,
            isFocused && styles.tabLabelFocused,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <View style={[styles.mainContent, { marginTop: verticalScale(15) }]}> 
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

          <View style={{ height: verticalScale(50) }} />
        </View>
      </ScrollView>

      {/* --- BARRA DE NAVEGAÇÃO --- */}
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

        <View style={{ width: scale(70), alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleTabPress("/register-pet")}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={28} color="#333" />
          </TouchableOpacity>
        </View>

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
