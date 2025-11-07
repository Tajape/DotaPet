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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; 

// =========================================================================
// 1. COMPONENTE PRINCIPAL (RegisterScreen)
// =========================================================================

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para visibilidade da senha (mantendo a funcionalidade do "olhinho")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const router = useRouter();

  // --- Função de Registro (Ação do Botão "Entrar") ---
  const handleRegister = () => {
    // 1. Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    // 2. Lógica de registro (Simulação)
    console.log('Tentativa de registro bem-sucedida.');
    
    // 3. Redireciona para a tela de Configuração de Perfil
    // Rota: /profile-setup
    router.replace('/user-profile');
  };

  const handleGoBack = () => {
    router.back();
  };

  // 🎯 Componente de Input de Senha Reutilizável
  const PasswordInput = ({ 
      label, 
      value, 
      onChangeText, 
      placeholder, 
      isVisible, 
      toggleVisibility 
    }: {
      label: string;
      value: string;
      onChangeText: (text: string) => void;
      placeholder: string;
      isVisible: boolean;
      toggleVisibility: () => void;
    }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInputField}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
        />
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={toggleVisibility}
        >
          <Ionicons 
            name={isVisible ? "eye-off" : "eye"} 
            size={24} 
            color="#999" 
          />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* --- Cabeçalho --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Cadastre-se</Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          
          {/* Input: Nome */}
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Input: E-mail */}
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Cadastre seu email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Input: Senha */}
          <PasswordInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="insira aqui sua senha"
            isVisible={isPasswordVisible}
            toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          {/* Input: Confirme sua senha */}
          <PasswordInput
            label="Confirme sua senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="insira aqui sua senha novamente"
            isVisible={isConfirmPasswordVisible}
            toggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          />

          {/* Botão Entrar (Finalizar Cadastro) */}
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Linha separadora "ou" */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Botões de Login Social (Usando Ionicons como placeholder) */}
          <TouchableOpacity style={[styles.socialButton, { marginBottom: 15 }]} activeOpacity={0.8}>
            <Ionicons name="logo-google" size={20} color="#333" />
            <Text style={styles.socialButtonText}>Continuar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Ionicons name="logo-facebook" size={20} color="#333" />
            <Text style={styles.socialButtonText}>Continuar com Facebook</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 10, 
    paddingBottom: 40,
  },
  
  // --- Cabeçalho ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 30, 
    paddingBottom: 35, 
    backgroundColor: '#fff',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44, 
    height: 44,
    opacity: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  // --- Inputs e Labels ---
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  
  // --- Inputs de Senha (Com Olhinho) ---
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  passwordInputField: {
    flex: 1, 
    paddingHorizontal: 15,
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 15, 
    height: '100%',
    justifyContent: 'center',
  },
  
  // --- Botão Principal ---
  registerButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#FFC837', 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  // --- Separador "ou" ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#999',
  },

  // --- Botões Sociais ---
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
});

export default RegisterScreen;