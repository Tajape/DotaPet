import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image, // Importado o componente Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
// Trocando a importação direta do Ionicons para garantir a compatibilidade de ambiente
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import * as ImagePicker from 'expo-image-picker'; 

// =========================================================================
// 1. COMPONENTE PRINCIPAL (UserProfileScreen)
// =========================================================================

const UserProfileScreen = () => {
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const router = useRouter();

  // --- Função para Upload/Seleção de Foto ---
  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria para selecionar uma imagem.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
    }
  };

  // --- Função para Adicionar/Atualizar Perfil (Ação do Botão) ---
  const handleAddProfile = () => {
    if (!username || !email || !phone || !location) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.log('Perfil do usuário configurado:', { username, email, phone, location, profileImage });
    
    Alert.alert('Sucesso!', 'Seu perfil foi configurado com sucesso. Vamos adotar!');
    
    // CORREÇÃO: Redireciona para o arquivo homeScreen.tsx
    router.replace('/homeScreen' as never); 
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // CORREÇÃO: Redireciona para o arquivo homeScreen.tsx (ou a rota inicial '/')
      router.replace('/homeScreen' as never); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#FFC837" />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" 
        >
          <View style={styles.contentContainer}>
            
            {/* Seção de Upload de Imagem */}
            <Text style={styles.imageLabel}>Insira uma imagem sua para seu perfil:</Text>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity onPress={handleImagePicker} style={styles.profileImageWrapper}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View>
                    <Ionicons name="person-circle-outline" size={100} color="#888" style={styles.userIcon} />
                    <View style={styles.addIconCircle}>
                      <Ionicons name="add" size={24} color="#333" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Input: Nome de Usuário */}
            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="insira seu nome de usuário"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* Input: E-mail */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="insira aqui seu email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* Input: Telefone(Whatsapp) */}
            <Text style={styles.label}>Telefone(Whatsapp)</Text>
            <TextInput
              style={styles.input}
              placeholder="insira aqui seu número para contato"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            {/* Input: Localização */}
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              placeholder="insira aqui sua localização"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
              returnKeyType="done"
            />

            {/* Botão Adicionar */}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =========================================================================
// 2. ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
  // --- Estrutura Básica ---
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 10, 
  },
  
  // --- Cabeçalho ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFC837',
    height: 60,
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonPlaceholder: {
    width: 28,
    opacity: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  // --- Seção de Imagem de Perfil ---
  imageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFC837',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  userIcon: {
    marginTop: 0,
    fontSize: 100,
  },
  addIconCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFC837',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  // --- Inputs e Labels ---
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  
  // --- Botão Principal ---
  addButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 10,
    backgroundColor: '#FFC837',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 20,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});

export default UserProfileScreen;
