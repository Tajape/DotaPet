import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";

import { User } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { db, queryDocuments } from "../firebase";
import { getCurrentUser } from "../services/authService";

// =========================================================================
// TIPOS
// =========================================================================

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  images: string[];
  ownerId: string;
}

// =========================================================================
// ESTILOS (MODIFICADOS)
// =========================================================================

const { width, height } = Dimensions.get("window");

// Função para dimensionamento responsivo
const responsiveSize = (size: number) => {
  const scale = Math.min(width, 600) / 375; // 375 é a largura base (iPhone 6/7/8)
  return Math.round(size * scale);
};

const createStyles = () =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f9f9f9", // Cor de fundo suave para o corpo
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsiveSize(15),
      paddingVertical: responsiveSize(15),
      // 🚀 MUDANÇA 1: Header Branco
      backgroundColor: "#ffffff",
      paddingTop:
        Platform.OS === "android"
          ? (StatusBar.currentHeight || 0) + 5
          : responsiveSize(15),
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    backButton: {
      padding: responsiveSize(5),
      marginRight: responsiveSize(15),
    },
    headerTitle: {
      fontSize: responsiveSize(24),
      fontWeight: "700",
      color: "#000000", // Título Preto
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      paddingVertical: responsiveSize(20),
      paddingHorizontal: responsiveSize(15),
      paddingBottom: responsiveSize(40),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: responsiveSize(20),
    },
    emptyIcon: {
      marginBottom: responsiveSize(15),
    },
    emptyText: {
      fontSize: responsiveSize(18),
      fontWeight: "600",
      color: "#333",
      textAlign: "center",
      marginBottom: responsiveSize(8),
    },
    emptySubText: {
      fontSize: responsiveSize(14),
      color: "#666",
      textAlign: "center",
      marginBottom: responsiveSize(20),
    },
    addPetButton: {
      backgroundColor: "#FFC837",
      paddingVertical: responsiveSize(12),
      paddingHorizontal: responsiveSize(20),
      borderRadius: responsiveSize(25),
      marginTop: responsiveSize(10),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    addPetButtonText: {
      color: "#333",
      fontWeight: "600",
      fontSize: responsiveSize(16),
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: responsiveSize(10),
      color: "#666",
      fontSize: responsiveSize(14),
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: responsiveSize(20),
    },
    errorText: {
      fontSize: responsiveSize(16),
      textAlign: "center",
      marginVertical: responsiveSize(20),
      color: "#333",
    },
    loginButton: {
      backgroundColor: "#FFC837",
      paddingVertical: responsiveSize(12),
      paddingHorizontal: responsiveSize(24),
      borderRadius: responsiveSize(25),
      marginTop: responsiveSize(10),
    },
    loginButtonText: {
      color: "#333",
      fontWeight: "600",
      fontSize: responsiveSize(16),
    },
    petCard: {
      backgroundColor: "#fff",
      borderRadius: responsiveSize(16),
      marginVertical: responsiveSize(10),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#f0f0f0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: "100%",
      alignSelf: "center",
      maxWidth: 520,
    },
    petImage: {
      width: "100%",
      height: responsiveSize(180),
      backgroundColor: "#f0f0f0",
    },
    petInfo: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsiveSize(12),
      paddingVertical: responsiveSize(10),
      borderTopWidth: 1,
      borderTopColor: "#F0F0F0",
      backgroundColor: "#fff",
    },
    petTextContainer: {
      flex: 1,
    },
    petName: {
      fontSize: responsiveSize(16),
      fontWeight: "800",
      color: "#111",
      marginBottom: responsiveSize(2),
    },
    petDetails: {
      fontSize: responsiveSize(12),
      color: "#666",
    },
    petAgeBadge: {
      backgroundColor: "#fff",
      borderRadius: responsiveSize(18),
      paddingHorizontal: responsiveSize(10),
      paddingVertical: responsiveSize(4),
      borderWidth: 1,
      borderColor: "#EEE",
      marginLeft: responsiveSize(8),
      alignSelf: "flex-start",
    },
    petAgeText: {
      fontSize: responsiveSize(12),
      fontWeight: "700",
      color: "#666",
    },
    actionsContainer: {
      flexDirection: "row",
      gap: responsiveSize(12),
      paddingHorizontal: responsiveSize(12),
      paddingBottom: responsiveSize(10),
      justifyContent: "flex-end",
      alignItems: "center",
    },
    actionButton: {
      width: responsiveSize(36),
      height: responsiveSize(36),
      borderRadius: responsiveSize(18),
      justifyContent: "center",
      alignItems: "center",
    },
    editButton: {
      backgroundColor: "#FFE08A", // amarelo mais claro
    },
    deleteButton: {
      backgroundColor: "#FF6B6B", // vermelho suave
    },
  });

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

export default function MyApplicationsScreen() {
  const { width } = useWindowDimensions();
  const styles = createStyles();
  const router = useRouter();

  // Adicionando estado para rastrear se o usuário está carregando
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Efeito para carregar o usuário atual
  useEffect(() => {
    console.log("Carregando usuário em MyApplicationsScreen...");
    const loadUser = async () => {
      try {
        const user = getCurrentUser();
        console.log("Usuário atual em MyApplicationsScreen:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar as informações do usuário"
        );
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função para validar e formatar os dados do pet
  const validateAndFormatPet = (id: string, data: any): Pet | null => {
    try {
      // Verifica se os campos obrigatórios existem
      if (!data.name || typeof data.name !== "string") {
        console.warn("Pet sem nome válido:", { id, data });
        return null;
      }

      // Cria um objeto pet com valores padrão para campos opcionais
      const pet: Pet = {
        id,
        name: String(data.name || "").trim(),
        breed: String(data.breed || "").trim(),
        age: String(data.age || "").trim(),
        gender: String(data.gender || "").trim(),
        images: Array.isArray(data.images)
          ? data.images.filter(
              (img: any) => typeof img === "string" && img.trim() !== ""
            )
          : [],
        ownerId: String(data.ownerId || "").trim(),
      };

      // Valida se o pet pertence ao usuário atual
      if (currentUser?.uid && pet.ownerId !== currentUser.uid) {
        console.warn("Tentativa de acessar pet de outro usuário:", {
          petOwner: pet.ownerId,
          currentUser: currentUser.uid,
        });
        return null;
      }

      return pet;
    } catch (error) {
      console.error("Erro ao validar pet:", { id, data, error });
      return null;
    }
  };

  // Função para carregar os pets do usuário com tratamento de erros aprimorado
  const loadUserPets = useCallback(async () => {
    console.log("Iniciando loadUserPets...");

    try {
      if (!currentUser?.uid) {
        console.log(
          "Nenhum usuário logado em loadUserPets, limpando lista de pets"
        );
        setPets([]);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      console.log(
        "Carregando pets para o usuário (queryDocuments):",
        currentUser.uid
      );

      // Usa helper genérico que já funciona em outras telas
      const docs = await queryDocuments("pets", [
        { field: "ownerId", operator: "==", value: currentUser.uid },
      ]);

      console.log(
        "Documentos retornados de queryDocuments(pets):",
        docs.length
      );

      const validPets: Pet[] = [];
      const invalidPets: any[] = [];

      docs.forEach((docData: any) => {
        const pet = validateAndFormatPet(docData.id, docData);
        if (pet) {
          validPets.push(pet);
        } else {
          invalidPets.push(docData);
        }
      });

      if (invalidPets.length > 0) {
        console.warn(
          `${invalidPets.length} pets inválidos encontrados em MyApplications:`,
          invalidPets
        );
      }

      console.log(
        `Carregados ${validPets.length} pets válidos em MyApplications`
      );
      setPets(validPets);
    } catch (error) {
      console.error("Erro ao carregar pets:", error);

      // Tenta recuperar o estado anterior em caso de erro
      try {
        const currentPets = [...pets];
        console.warn(
          "Mantendo lista atual de pets devido ao erro:",
          currentPets.length
        );
      } catch (e) {
        console.error("Erro ao recuperar estado anterior:", e);
        setPets([]);
      }

      // Mostra mensagem de erro amigável
      Alert.alert(
        "Erro ao Carregar",
        "Não foi possível carregar a lista de pets. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.uid]);

  // Função para recarregar a lista de pets
  const reloadPets = useCallback(async () => {
    try {
      setIsLoading(true);
      await loadUserPets();
    } catch (error) {
      console.error("Erro ao recarregar pets:", error);
      Alert.alert("Erro", "Não foi possível recarregar os pets");
    }
  }, [loadUserPets]);

  // Função para o pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    reloadPets();
  }, [reloadPets]);

  // Função para editar pet
  const handleEditPet = useCallback(
    (petId: string) => {
      router.push({
        pathname: "/register-pet",
        params: { petId },
      });
    },
    [router]
  );

  // Função para deletar pet com atualização otimista
  const handleDeletePet = useCallback(
    (petId: string, petName: string) => {
      console.log("Iniciando exclusão do pet:", { petId, petName });

      // Função para mostrar alerta de confirmação
      const showConfirmation = () => {
        Alert.alert(
          "Confirmar Exclusão",
          `Tem certeza que deseja remover ${petName}? Esta ação não pode ser desfeita.`,
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => console.log("Exclusão cancelada pelo usuário"),
            },
            {
              text: "Remover",
              style: "destructive",
              onPress: async () => {
                try {
                  console.log("Confirmada exclusão do pet:", {
                    petId,
                    petName,
                  });
                  setDeletingPetId(petId);

                  // Otimistic update - remove o pet do estado imediatamente
                  setPets((prevPets) => {
                    const updatedPets = prevPets.filter(
                      (pet) => pet.id !== petId
                    );
                    console.log(
                      "Atualização otimista - pets restantes:",
                      updatedPets.length
                    );
                    return updatedPets;
                  });

                  // Faz a chamada para a API
                  console.log("Iniciando exclusão no Firestore...");
                  const petRef = doc(db, "pets", petId);
                  await deleteDoc(petRef);

                  console.log("Pet removido com sucesso do Firestore");

                  // Mostra feedback visual de sucesso
                  Alert.alert(
                    "Sucesso",
                    `${petName} foi removido com sucesso.`
                  );
                } catch (error) {
                  console.error("Erro ao remover pet:", error);

                  // Reverte a atualização otimista em caso de erro
                  console.log("Revertendo atualização otimista...");
                  await reloadPets();

                  // Mostra mensagem de erro apropriada
                  let errorMessage = "Não foi possível remover o pet.";
                  if (error instanceof Error) {
                    console.error("Detalhes do erro:", error.message);
                    errorMessage += `\n\nDetalhes: ${error.message}`;
                  }

                  Alert.alert("Erro", errorMessage);
                } finally {
                  setDeletingPetId(null);
                }
              },
            },
          ],
          { cancelable: true }
        );
      };

      // Verifica se já existe uma exclusão em andamento
      if (deletingPetId) {
        console.log("Já existe uma operação de exclusão em andamento");
        return;
      }

      // Mostra o diálogo de confirmação
      showConfirmation();
    },
    [deletingPetId, reloadPets]
  );

  // Configurar o botão de voltar
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Configurar o botão de voltar físico no Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [handleGoBack])
  );

  // Carregar pets quando a tela receber foco ou quando o usuário mudar
  useFocusEffect(
    useCallback(() => {
      console.log(
        "Tela MyApplications em foco, usuário atual:",
        currentUser,
        "userLoading:",
        userLoading
      );

      if (!userLoading) {
        setIsLoading(true);
        reloadPets();
      }

      return () => {
        console.log("Saindo de foco de MyApplicationsScreen");
      };
    }, [reloadPets, currentUser, userLoading])
  );

  // Mostrar loading enquanto carrega o usuário
  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC837" />
        <Text style={styles.loadingText}>
          Carregando informações do usuário...
        </Text>
      </View>
    );
  }

  // Se não estiver logado, mostrar mensagem
  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#FFC837" />
        <Text style={styles.errorText}>
          Você precisa estar logado para acessar esta página
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Ir para o Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        {/* 🚀 MUDANÇA 3.1: StatusBar para ícones escuros (Dark content) */}
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            {/* 🚀 MUDANÇA 2.1: Ícone de voltar preto */}
            <Ionicons name="arrow-back" size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Pets</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC837" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 🚀 MUDANÇA 3.2: StatusBar para ícones escuros (Dark content) */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          {/* 🚀 MUDANÇA 2.2: Ícone de voltar preto */}
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pets</Text>
      </View>

      {/* CONTEÚDO */}
      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="paw" size={64} color="#FFC837" />
          </View>
          <Text style={styles.emptyText}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptySubText}>
            Você ainda não cadastrou nenhum pet.
          </Text>
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={() => router.push("/register-pet")}
          >
            <Text style={styles.addPetButtonText}>Adicionar Pet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFC837"]}
              tintColor="#FFC837"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <Image
                source={{
                  uri:
                    item.images && item.images.length > 0
                      ? item.images[0]
                      : "https://placehold.co/100x100/A0A0A0/FFFFFF?text=Sem+Foto",
                }}
                style={styles.petImage}
                resizeMode="cover"
              />

              <View style={styles.petInfo}>
                <View>
                  <Text
                    style={styles.petName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.petDetails} numberOfLines={1}>
                    {item.breed} • {item.age}
                  </Text>
                  <Text style={styles.petDetails} numberOfLines={1}>
                    {item.gender}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditPet(item.id)}
                >
                  <Ionicons name="pencil" size={20} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeletePet(item.id, item.name)}
                  disabled={deletingPetId === item.id}
                >
                  {deletingPetId === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="trash" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
