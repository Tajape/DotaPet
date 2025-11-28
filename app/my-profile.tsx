import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  BackHandler,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, // <-- Importado para a confirmação
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Dados de Perfil Mock (Mantido)
const MOCK_USER_PROFILE = {
  imageUri: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=EU",
  username: "Seu Usuário",
  location: "Cidade, Estado",
};

// =========================================================================
// Componentes Auxiliares (Mantidos)
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
}) => (
  <TouchableOpacity
    key={route}
    style={styles.tabItem}
    onPress={() => onPress(route)}
  >
    <Ionicons
      name={
        isFocused
          ? (name.replace("-outline", "") as "person")
          : (name as "person-outline")
      }
      size={24}
      color={isFocused ? "#333" : "#666"}
    />
    <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </TouchableOpacity>
);

interface OptionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <View style={styles.optionButtonContent}>
      <Ionicons name={icon as "heart-outline"} size={24} color="#333" />
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color="#999" />
  </TouchableOpacity>
);

// =========================================================================
// COMPONENTE PRINCIPAL (MyProfileScreen)
// =========================================================================

const MyProfileScreen = () => {
  const router = useRouter();
  const currentRoute = router.pathname || "/my-profile";

  // LÓGICA DE VOLTAR: SEMPRE LEVA PARA A HOME (Mantido)
  const handleGoBack = () => {
    router.replace("/homeScreen" as never);
  };

  // Handle do botão de voltar do sistema (Mantido)
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
    }, [])
  );

  // LÓGICA DOS OUTROS BOTÕES (Mantido)
  const handleFavoritesPress = () => {
    router.replace("/favorites" as never);
  };

  const handleApplicationsPress = () => {
    console.log("Navegar para Minhas Candidaturas");
  };

  const handleEditProfilePress = () => {
    router.push("/user-profile" as never);
  };
  
  // ⭐ LÓGICA DO BOTÃO SAIR COM CONFIRMAÇÃO (ROTA CORRIGIDA)
  const handleLogout = () => {
    Alert.alert(
      "Confirmar Saída",
      "Tem certeza que deseja deslogar da sua conta?",
      [
        // Botão 'Cancelar'
        {
          text: "Cancelar",
          style: "cancel",
        },
        // Botão 'Sim, Sair'
        {
          text: "Sim, Sair",
          onPress: () => {
            // ROTA CORRIGIDA PARA "/welcome"
            router.replace("/welcome" as never); 
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };


  const handleTabPress = (route: string) => {
    if (route === currentRoute) {
      return;
    }

    if (route === "/register-pet") {
      router.push("/register-pet" as never);
    } else {
      router.replace(route as never);
    }
  };

  const screenOptions = {
    headerShown: false,
    animation: "none" as const,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={screenOptions} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ------------------ 1. CABEÇALHO ------------------ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      {/* ------------------ 2. CONTEÚDO PRINCIPAL ------------------ */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações do Usuário */}
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: MOCK_USER_PROFILE.imageUri }}
            style={styles.profileImage}
          />
          <Text style={styles.usernameText}>{MOCK_USER_PROFILE.username}</Text>
          <Text style={styles.locationText}>{MOCK_USER_PROFILE.location}</Text>
        </View>

        {/* Seção de Opções */}
        <View style={styles.optionsSection}>
          {/* BOTÃO MEUS FAVORITOS */}
          <OptionButton
            icon="heart-outline"
            label="Meus Favoritos"
            onPress={handleFavoritesPress}
          />

          {/* ✅ BOTÃO: MINHAS CANDIDATURAS (Ícone Patinha) */}
          <OptionButton
            icon="paw-outline" // Ícone de pata
            label="Minhas Candidaturas"
            onPress={handleApplicationsPress}
          />

          {/* BOTÃO: EDITAR PERFIL */}
          <OptionButton
            icon="create-outline" // Ícone de edição/lápis
            label="Editar Perfil"
            onPress={handleEditProfilePress}
          />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout} // <-- FUNÇÃO COM ROTA CORRIGIDA
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ------------------ 3. BARRA DE NAVEGAÇÃO INFERIOR ------------------ */}
      <View style={styles.tabBarContainer}>
        <TabItem
          name="home-outline"
          label="Início"
          route="/homeScreen"
          isFocused={currentRoute === "/homeScreen"}
          onPress={handleTabPress}
        />
        <TabItem
          name="search-outline"
          label="Pesquisar"
          route="/searchScreen"
          isFocused={currentRoute === "/searchScreen"}
          onPress={handleTabPress}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleTabPress("/register-pet")}
        >
          <Ionicons name="add" size={32} color="#333" />
        </TouchableOpacity>

        <TabItem
          name="heart-outline"
          label="Favoritos"
          route="/favorites"
          isFocused={currentRoute === "/favorites"}
          onPress={handleTabPress}
        />

        <TabItem
          name="person-outline"
          label="Perfil"
          route="/my-profile"
          isFocused={currentRoute === "/my-profile"}
          onPress={handleTabPress}
        />
      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILIZAÇÃO (NÃO ALTERADA)
// =========================================================================

const styles = StyleSheet.create({
  // --- Estrutura Básica ---
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // --- 1. Cabeçalho Personalizado ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 5 : 15,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },

  // --- 2. Conteúdo do Perfil ---
  userInfoContainer: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFC837",
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },

  // Seção de Opções
  optionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    marginTop: 30,
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E74C3C",
  },

  // --- 3. Bottom Tab Bar (Mantida Consistente) ---
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    backgroundColor: "#FFC837",
    height: 85,
    paddingHorizontal: 5,
    paddingTop: 8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
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
  addButton: {
    backgroundColor: "#fff",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    borderWidth: 5,
    borderColor: "#FFC837",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default MyProfileScreen;