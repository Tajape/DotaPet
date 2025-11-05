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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; 

// =========================================================================
// COMPONENTE PRINCIPAL (NewPasswordScreen)
// =========================================================================

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 🎯 NOVOS ESTADOS para controlar a visibilidade da senha
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const router = useRouter();

  // --- Função de Ação ---
  const handleResetPassword = () => {
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }
    
    console.log('Nova senha definida com sucesso.');
    
    // Alerta de sucesso antes de redirecionar para Login
    Alert.alert(
      'Sucesso!', 
      'Sua senha foi atualizada. Faça login com a nova senha.',
      [
        {
          text: 'Ok',
          // Redireciona para a tela de Login
          onPress: () => router.replace('/login'), 
        }
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  // 🎯 COMPONENTE DE INPUT DE SENHA REUTILIZÁVEL (Similar ao de Cadastro/Login)
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
      {/* O marginTop do label é o único ajuste necessário para o espaçamento vertical */}
      <Text style={[styles.label, { marginTop: label === 'Nova Senha' ? 30 : 15 }]}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInputField} // Estilo ajustado para acomodar o ícone
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible} // Controlado pelo estado
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

      {/* --- Cabeçalho (Consistente) --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Definir Nova Senha</Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* 🎯 Input: Nova Senha COM OLHINHO */}
        <PasswordInput
          label="Nova Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="insira sua nova senha"
          isVisible={isPasswordVisible}
          toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
        />

        {/* 🎯 Input: Confirme a Senha COM OLHINHO */}
        <PasswordInput
          label="Confirme a Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="confirme sua nova senha"
          isVisible={isConfirmPasswordVisible}
          toggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        />
        
        {/* Botão Salvar Senha */}
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleResetPassword}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Salvar Senha</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILIZAÇÃO (Ajustes para o Olhinho)
// =========================================================================

const styles = StyleSheet.create({
  // --- Estrutura Básica ---
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 0, 
  },
  
  // --- Cabeçalho (Header) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 30, 
    paddingBottom: 35, 
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

  // --- Inputs de Texto ---
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  
  // 🎯 NOVOS ESTILOS PARA INPUT COM SENHA (Olhinho)
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
    flex: 1, // Ocupa a maior parte do espaço
    paddingHorizontal: 15,
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 15, // Espaçamento para o toque
    height: '100%',
    justifyContent: 'center',
  },
  // ------------------------------------
  
  // --- Botão Salvar Senha ---
  resetButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#FFC837', 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default NewPasswordScreen;