import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getDocument } from "../../firebase";
import { getCurrentUser } from "../../services/authService";
import { ms as moderateScale, hs as scale, vs as verticalScale } from "../utils/responsive";

// =========================================================================
// TIPOS
// =========================================================================

interface Pet {
  id: string;
  name: string;
  age: string;
  breed: string;
  color: string;
  size: "pequeno" | "médio" | "grande";
  gender: "Macho" | "Fêmea";
  isVaccinated: boolean;
  isNeutered: boolean;
  description: string;
  images: string[];
  ownerId: string;
  createdAt: any;
}

interface Owner {
  username?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  profileImage?: string | null;
}

// =========================================================================
// ESTILOS
// =========================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFC837",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: "#FFC837",
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight || 0) + verticalScale(10)
        : verticalScale(10),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageCarousel: {
    width: "100%",
    height: verticalScale(300),
    backgroundColor: "#F0F0F0",
    position: "relative",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageCounter: {
    position: "absolute",
    bottom: scale(12),
    right: scale(12),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
  },
  imageCounterText: {
    color: "#FFF",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  arrowButton: {
    position: "absolute",
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    marginTop: -scale(20),
  },
  leftArrow: {
    left: scale(12),
  },
  rightArrow: {
    right: scale(12),
  },
  contentContainer: {
    backgroundColor: "#FFC837",
    borderTopLeftRadius: scale(30),
    borderTopRightRadius: scale(30),
    marginTop: -scale(20),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(30),
  },
  petName: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    color: "#333",
    marginBottom: verticalScale(12),
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
    marginBottom: verticalScale(20),
  },
  badge: {
    backgroundColor: "#FFF",
    borderRadius: scale(20),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderWidth: 1,
    borderColor: "#EEE",
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#333",
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#333",
    marginBottom: verticalScale(12),
  },
  sectionDescription: {
    fontSize: moderateScale(13),
    color: "#666",
    lineHeight: 20,
    fontWeight: "500",
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  ownerImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#E0E0E0",
    marginRight: scale(12),
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#333",
    marginBottom: verticalScale(4),
  },
  ownerLocation: {
    fontSize: moderateScale(12),
    color: "#666",
    marginBottom: verticalScale(4),
    flexDirection: "row",
    alignItems: "center",
  },
  ownerPhone: {
    fontSize: moderateScale(12),
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  characteristicItem_last: {
    borderBottomWidth: 0,
  },
  characteristicIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#FFC837",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  characteristicText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#333",
  },
  characteristicValue: {
    fontSize: moderateScale(13),
    color: "#666",
    marginTop: verticalScale(2),
  },
  adoptButton: {
    backgroundColor: "#69e286ff",
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(8),
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  adoptButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC837",
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: "#333",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC837",
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  retryButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
});

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

const PetDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const currentUser = getCurrentUser();

  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do pet
  useEffect(() => {
    const loadPetData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 🔧 VERIFICAR ID
        if (!id || Array.isArray(id)) {
          console.error("❌ ID inválido:", id);
          setError("ID do pet inválido");
          return;
        }

        console.log("📱 Carregando pet com ID:", id);

        // 🔧 BUSCAR DADOS DO PET
        const petData = await getDocument("pets", id);

        if (!petData) {
          console.error("❌ Pet não encontrado no Firestore");
          setError("Pet não encontrado no banco de dados");
          return;
        }

        console.log("✅ Pet carregado:", petData);

        // 🔧 VALIDAR E PROCESSAR DADOS
        const processedPet: Pet = {
          id: id,
          name: petData.name || "Pet sem nome",
          age: petData.age || "Idade desconhecida",
          breed: petData.breed || "Raça desconhecida",
          color: petData.color || "Cor desconhecida",
          size: petData.size || "médio",
          gender: petData.gender || "Macho",
          isVaccinated: petData.isVaccinated === true,
          isNeutered: petData.isNeutered === true,
          description: petData.description || "",
          images:
            Array.isArray(petData.images) && petData.images.length > 0
              ? petData.images
              : [
                  petData.image ||
                    "https://placehold.co/300x300/A0A0A0/FFFFFF?text=Sem+Foto",
                ],
          ownerId: petData.ownerId || "",
          createdAt: petData.createdAt || null,
        };

        setPet(processedPet);
        console.log("✅ Pet processado:", processedPet);

        // 🔧 BUSCAR DADOS DO PROPRIETÁRIO
        if (petData.ownerId) {
          console.log("📱 Carregando dados do dono:", petData.ownerId);
          const ownerData = await getDocument("users", petData.ownerId);

          if (ownerData) {
            console.log("✅ Dono carregado:", ownerData);
            // 🔧 Garantir que tem endereço
            setOwner({
              username: ownerData.username || "Usuário",
              email: ownerData.email,
              phone: ownerData.phone,
              city: ownerData.city || "Não informado",
              state: ownerData.state,
              neighborhood: ownerData.neighborhood,
              profileImage: ownerData.profileImage,
            } as Owner);
          } else {
            console.warn("⚠️ Dados do dono não encontrados");
          }
        } else {
          console.warn("⚠️ Pet sem ID de proprietário");
        }
      } catch (error) {
        console.error("❌ Erro ao carregar pet:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar pet";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [id]);

  // Navegar entre imagens
  const goToPreviousImage = () => {
    if (pet && Array.isArray(pet.images) && pet.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? pet.images.length - 1 : prev - 1
      );
    }
  };

  const goToNextImage = () => {
    if (pet && Array.isArray(pet.images) && pet.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === pet.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Abrir WhatsApp
  const openWhatsApp = () => {
    if (!owner?.phone) {
      Alert.alert("Erro", "Telefone do dono não disponível");
      return;
    }

    try {
      const phoneNumber = owner.phone.replace(/\D/g, "");
      const fullPhoneNumber = phoneNumber.startsWith("55")
        ? phoneNumber
        : `55${phoneNumber}`;

      const message = `Olá! Tenho interesse no pet ${pet?.name}. Podemos conversar mais sobre?`;
      const url = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(
        message
      )}`;

      Linking.openURL(url).catch((error) => {
        console.error("❌ Erro ao abrir WhatsApp:", error);
        Alert.alert("Erro", "WhatsApp não está instalado");
      });
    } catch (error) {
      console.error("❌ Erro ao processar telefone:", error);
      Alert.alert("Erro", "Erro ao processar o número de telefone");
    }
  };

  // 🔧 LOADING STATE
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Carregando pet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🔧 ERROR STATE
  if (error || !pet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || "Pet não encontrado"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images =
    Array.isArray(pet.images) && pet.images.length > 0
      ? pet.images
      : ["https://placehold.co/300x300/A0A0A0/FFFFFF?text=Sem+Foto"];

  const currentImage = images[currentImageIndex] || images[0];
  const isOwnPet = currentUser?.uid === pet.ownerId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#FFC837" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF3B30" : "#333"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* --- CARROSSEL DE IMAGENS --- */}
        <View style={styles.imageCarousel}>
          <Image source={{ uri: currentImage }} style={styles.petImage} />

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.arrowButton, styles.leftArrow]}
                onPress={goToPreviousImage}
              >
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arrowButton, styles.rightArrow]}
                onPress={goToNextImage}
              >
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </>
          )}

          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <View style={styles.contentContainer}>
          <Text style={styles.petName}>{pet.name}</Text>

          <View style={styles.badgesContainer}>
            {pet.isVaccinated && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Vacinado</Text>
              </View>
            )}
            {pet.isNeutered && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Castrado</Text>
              </View>
            )}
            {pet.age && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pet.age}</Text>
              </View>
            )}
          </View>

          {/* SOBRE O PET */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o Pet</Text>
            <Text style={styles.sectionDescription}>
              {pet.description || "Sem descrição disponível"}
            </Text>
          </View>

          {/* FALAR COM */}
          {!isOwnPet && owner && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Falar com:</Text>
              <View style={styles.ownerCard}>
                <Image
                  source={{
                    uri:
                      owner.profileImage ||
                      "https://placehold.co/50x50/A0A0A0/FFFFFF?text=Usuário",
                  }}
                  style={styles.ownerImage}
                />
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>
                    {owner.username || "Usuário"}
                  </Text>
                  {owner.city && (
                    <View style={styles.ownerLocation}>
                      <Ionicons name="location" size={12} color="#666" />
                      <Text
                        style={{
                          marginLeft: 4,
                          fontSize: moderateScale(12),
                          color: "#666",
                        }}
                      >
                        {owner.city}
                        {owner.state ? `, ${owner.state}` : ""}
                      </Text>
                    </View>
                  )}
                  {owner.phone && (
                    <View style={styles.ownerPhone}>
                      <Ionicons name="call" size={12} color="#666" />
                      <Text
                        style={{
                          marginLeft: 4,
                          fontSize: moderateScale(12),
                          color: "#666",
                        }}
                      >
                        {owner.phone}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* CARACTERÍSTICAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>

            {pet.size && (
              <View style={styles.characteristicItem}>
                <View style={styles.characteristicIcon}>
                  <Ionicons name="resize" size={18} color="#333" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.characteristicText}>Porte</Text>
                  <Text style={styles.characteristicValue}>
                    {pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}
                  </Text>
                </View>
              </View>
            )}

            {pet.color && (
              <View style={styles.characteristicItem}>
                <View style={styles.characteristicIcon}>
                  <Ionicons name="color-palette" size={18} color="#333" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.characteristicText}>Cor</Text>
                  <Text style={styles.characteristicValue}>{pet.color}</Text>
                </View>
              </View>
            )}

            {pet.gender && (
              <View style={styles.characteristicItem}>
                <View style={styles.characteristicIcon}>
                  <Ionicons name="male-female" size={18} color="#333" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.characteristicText}>Sexo</Text>
                  <Text style={styles.characteristicValue}>{pet.gender}</Text>
                </View>
              </View>
            )}

            {pet.breed && (
              <View style={styles.characteristicItem}>
                <View style={styles.characteristicIcon}>
                  <Ionicons name="paw" size={18} color="#333" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.characteristicText}>Raça</Text>
                  <Text style={styles.characteristicValue}>{pet.breed}</Text>
                </View>
              </View>
            )}

            {pet.age && (
              <View style={styles.characteristicItem}>
                <View style={styles.characteristicIcon}>
                  <Ionicons name="calendar" size={18} color="#333" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.characteristicText}>Idade</Text>
                  <Text style={styles.characteristicValue}>{pet.age}</Text>
                </View>
              </View>
            )}

            <View
              style={[
                styles.characteristicItem,
                styles.characteristicItem_last,
              ]}
            >
              <View style={styles.characteristicIcon}>
                <Ionicons name="location" size={18} color="#333" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.characteristicText}>Localização</Text>
                <Text style={styles.characteristicValue}>
                  {owner?.city || "Não informada"}
                </Text>
              </View>
            </View>
          </View>

          {/* BOTÃO ADOÇÃO */}
          {!isOwnPet && (
            <TouchableOpacity
              style={styles.adoptButton}
              onPress={openWhatsApp}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.adoptButtonText}>Quero Adotar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PetDetailsScreen;
