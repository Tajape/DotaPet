import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteDocument, queryDocuments } from "../firebase";
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
// ESTILOS
// =========================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#FFC837",
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
    color: "#fff",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  petCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  petImage: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  petInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#FFC837",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
});

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

const MyApplicationsScreen = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar pets do usuário
  useFocusEffect(
    useCallback(() => {
      const loadUserPets = async () => {
        try {
          setIsLoading(true);
          if (currentUser?.uid) {
            // Buscar todos os pets do usuário
            const userPets = await queryDocuments(
              "pets",
              "ownerId",
              currentUser.uid
            );
            setPets(userPets as Pet[]);
          }
        } catch (error) {
          console.error("Erro ao carregar pets:", error);
          Alert.alert("Erro", "Não foi possível carregar os pets");
        } finally {
          setIsLoading(false);
        }
      };

      loadUserPets();

      // Handle do botão de voltar
      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [currentUser])
  );

  // Função para editar pet
  const handleEditPet = (petId: string) => {
    router.push({
      pathname: "/register-pet",
      params: { petId }, // Passar o ID do pet para edição
    } as never);
  };

  // Função para deletar pet
  const handleDeletePet = (petId: string, petName: string) => {
    Alert.alert("Deletar Pet", `Tem certeza que deseja deletar ${petName}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Deletar",
        onPress: async () => {
          try {
            await deleteDocument("pets", petId);
            setPets(pets.filter((p) => p.id !== petId));
            Alert.alert("Sucesso", "Pet deletado com sucesso!");
          } catch (error) {
            console.error("Erro ao deletar pet:", error);
            Alert.alert("Erro", "Não foi possível deletar o pet");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#FFC837" />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minhas Candidaturas</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#FFC837" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Candidaturas</Text>
      </View>

      {/* CONTEÚDO */}
      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="paw" size={64} color="#FFC837" />
          </View>
          <Text style={styles.emptyText}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptySubText}>
            Crie seu primeiro anúncio de pet para começar
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
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
              />

              <View style={styles.petInfo}>
                <View>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petDetails}>
                    {item.breed} • {item.age}
                  </Text>
                  <Text style={styles.petDetails}>{item.gender}</Text>
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
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default MyApplicationsScreen;
