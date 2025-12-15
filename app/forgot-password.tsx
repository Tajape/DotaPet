import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPassword } from '../services/authService';

// =========================================================================
// COMPONENTE PRINCIPAL (ForgotPasswordScreen)
// =========================================================================

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  // --- Função para enviar email de redefinição ---
  const handleSendRecoveryCode = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Atenção', 'Por favor, insira um e-mail válido.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
      
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      Alert.alert(
        'Erro',
        'Não foi possível enviar o email de redefinição. Verifique se o email está correto e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    // Volta para a tela anterior (TelaLogin)
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* --- Cabeçalho Personalizado (Seta + Título) --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Recupere sua senha!</Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* Texto de instrução */}
        <Text style={styles.instructionText}>
          Insira seu E-mail para enviarmos o código de recuperação:
        </Text>

        {/* Campo de E-mail */}
        <TextInput
          style={styles.input}
          placeholder="insira aqui seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Botão Enviar */}
        {emailSent ? (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.successText}>
              Enviamos um link de recuperação para seu e-mail.
              {'\n'}Verifique sua caixa de entrada e spam.
            </Text>
            <TouchableOpacity 
              style={[styles.backToLoginButton]}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.backToLoginText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]} 
            onPress={handleSendRecoveryCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILIZAÇÃO (Harmonizada com TelaLogin)
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
    paddingTop: 20, 
  },
  
  // --- Cabeçalho (Header) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 10,
    zIndex: 10, 
  },
  backButtonPlaceholder: {
    width: 24, 
    paddingRight: 10,
    opacity: 0,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  // --- Conteúdo Específico ---
  instructionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontWeight: '500',
    marginBottom: 30,
    paddingHorizontal: 10, 
  },
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 40,
  },
  
  // --- Botão Enviar (Mesmo estilo do Botão Login) ---
  sendButton: {
    backgroundColor: '#FFC837',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successMessage: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
    width: '100%',
  },
  successIcon: {
    marginBottom: 12,
  },
  successText: {
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  backToLoginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  backToLoginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default ForgotPasswordScreen;