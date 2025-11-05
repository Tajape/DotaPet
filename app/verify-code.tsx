import React, { useState, useRef, createRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Keyboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; 

const CODE_LENGTH = 4;

// =========================================================================
// 1. COMPONENTE PRINCIPAL (VerifyCodeScreen)
// =========================================================================

const VerifyCodeScreen = () => {
  // Estado para armazenar o código como array de dígitos
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const router = useRouter();

  // Array de refs para controlar o foco dos 4 inputs
  const inputRefs = useRef<Array<React.RefObject<TextInput>>>(
    Array(CODE_LENGTH).fill(0).map(() => createRef<TextInput>())
  );

  // Lógica para preencher o dígito e mover o foco para o próximo campo
  const handleCodeChange = (text: string, index: number) => {
    // Pega o último caractere digitado (útil para paste)
    const newDigit = text.length > 0 ? text[text.length - 1] : '';

    const newCode = [...code];
    newCode[index] = newDigit;
    setCode(newCode);

    // Navega para o próximo input se um dígito foi inserido e não é o último
    if (newDigit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1].current?.focus();
    }
  };

  /**
   * CORREÇÃO DO BACKSPACE:
   * Move o foco para o input anterior se o campo atual estiver vazio
   * e o usuário pressionar Backspace.
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        inputRefs.current[index - 1].current?.focus();
      }
    }
  };


  const handleVerifyCode = () => {
    const fullCode = code.join('');

    if (fullCode.length !== CODE_LENGTH) {
      Alert.alert('Atenção', `O código deve ter ${CODE_LENGTH} dígitos.`);
      return;
    }
    
    Keyboard.dismiss();
    console.log('Código Verificado:', fullCode);
    
    // 🎯 AÇÃO FINAL: Redirecionar diretamente para a tela de Nova Senha
    // (Removendo o Alert de "Sucesso")
    router.push('/new-password'); 
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* --- Cabeçalho (AJUSTADO: Mais espaço vertical e centralização) --- */}
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
          Insira o código de recuperação que enviamos para seu E-mail:
        </Text>

        {/* --- Container dos Inputs de Código (OTP) --- */}
        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs.current[index]}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad" 
              maxLength={1} 
              textAlign="center" 
              autoFocus={index === 0}
              selectionColor="#FFC837" 
            />
          ))}
        </View>
        
        {/* Botão Enviar */}
        <TouchableOpacity style={styles.sendButton} onPress={handleVerifyCode}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILIZAÇÃO (Com padding ajustado e design refinado)
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
    paddingHorizontal: 15,
    paddingTop: 30,    // Aumentado para descer o conteúdo
    paddingBottom: 35, // Aumentado para manter o respiro
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

  // --- Conteúdo OTP ---
  instructionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontWeight: '500',
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  codeInput: {
    width: 60, 
    height: 60,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#F7F7F7', // Fundo sutilmente cinza
    textAlign: 'center',
    shadowColor: 'transparent', 
  },
  
  // --- Botão Enviar ---
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

export default VerifyCodeScreen;