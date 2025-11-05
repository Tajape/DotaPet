import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons'; 

// =========================================================================
// COMPONENTE PRINCIPAL (ForgotPasswordScreen)
// =========================================================================

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  // --- Função de Ação ---
  const handleSendRecoveryCode = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Atenção', 'Por favor, insira um e-mail válido.');
      return;
    }
    
    console.log('Solicitação de recuperação enviada para:', email);
    
    // Simulação de envio bem-sucedido (sem pop-up, para UX limpa)
    
    // 🎯 MUDANÇA: Navega para a tela de Verificação de Código
    // Assumindo que a próxima tela está em '/verify-code'
    router.push('/verify-code');
    
    // Opcional: Você pode manter um Alert para depuração ou feedback, mas o ideal é navegar
    // Alert.alert('Sucesso', `Código enviado. Verifique seu e-mail.`);
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
        <TouchableOpacity style={styles.sendButton} onPress={handleSendRecoveryCode}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>

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
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#FFC837', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default ForgotPasswordScreen;