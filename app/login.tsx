import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../services/authService';

// Define a largura da tela para uso em estilos responsivos (Embora não usado diretamente no estilo abaixo, é útil manter)
const { width } = Dimensions.get('window');

// --- ATENÇÃO: IMPORTAÇÃO DAS IMAGENS/ÍCONES ---
// Use os caminhos corretos para seus assets
// Usando 'any' temporariamente se o caminho exato não for resolvido automaticamente pelo ambiente
const googleIconSource: ImageSourcePropType = require('../assets/images/icone-google.png');
const facebookIconSource: ImageSourcePropType = require('../assets/images/icone-facebook.png');
// ------------------------------------------------

// =========================================================================
// 1. CONSTANTES DE ÍCONES (IMAGEM)
// =========================================================================

const GoogleIcon = () => (
  <Image source={googleIconSource} style={styles.socialIconImage} />
);

const FacebookIcon = () => (
  <Image source={facebookIconSource} style={styles.socialIconImage} />
);

// =========================================================================
// 2. INTERFACES E COMPONENTES REUTILIZÁVEIS
// =========================================================================

interface SocialButtonProps {
  IconComponent: React.FC; 
  title: string;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  IconComponent,
  title,
  onPress,
}) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress}>
    <IconComponent />
    <Text style={styles.socialButtonText}>{title}</Text>
  </TouchableOpacity>
);

// =========================================================================
// 3. COMPONENTE PRINCIPAL (TelaLogin)
// =========================================================================

const TelaLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // --- Função de Login com Firebase ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro de Login', 'Por favor, insira e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);
      Alert.alert('Sucesso!', 'Login realizado com sucesso!');
      // Pequeno delay para garantir que o auth state foi atualizado
      setTimeout(() => {
        router.replace('/homeScreen' as never);
      }, 500);
    } catch (error: any) {
      Alert.alert('Erro de Login', error.message || 'Falha ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navegando para Esqueceu Senha');
    router.push('/forgot-password' as never);
  };
  
  const handleGoBack = () => {
    router.back();
  };

  // Funções de login social (apenas logs para este exemplo)
  const handleGoogleLogin = () => { console.log('Login com Google'); };
  const handleFacebookLogin = () => { console.log('Login com Facebook'); };


  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Cabeçalho Personalizado (Seta + Título) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bem vindo de volta!</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
          <View style={styles.contentContainer}>
        {/* Campo de E-mail */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="insira aqui seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* 🎯 CAMPO DE SENHA COM OLHINHO */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordInputContainer} pointerEvents="box-none">
          <TextInput
            style={styles.passwordInputField}
            placeholder="insira aqui sua senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => handleLogin()}
            secureTextEntry={!isPasswordVisible}
            editable={true}
            selectTextOnFocus={false}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="go"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
            pointerEvents="box-only"
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off" : "eye"} 
              size={24} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Link Esqueci Minha Senha */}
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Separador "ou" */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Botões de Login Social */}
        <View style={styles.socialLoginArea}>
          <SocialButton
            IconComponent={GoogleIcon}
            title="Continuar com Google"
            onPress={handleGoogleLogin}
          />
          <SocialButton
            IconComponent={FacebookIcon}
            title="Continuar com Facebook"
            onPress={handleFacebookLogin}
          />
        </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =========================================================================
// 4. ESTILIZAÇÃO (Ajustes para o Olhinho)
// =========================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  
  // 🎯 NOVO ESTILO: Input padrão (para E-mail)
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
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
    paddingHorizontal: 15, // Espaçamento para o ícone
    height: '100%',
    justifyContent: 'center',
  },
  // ------------------------------------

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#FFC837',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  separatorText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#999',
  },
  socialLoginArea: {
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#AAAAAA',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  socialIconImage: {
    width: 24, 
    height: 24, 
    marginRight: 15, 
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default TelaLogin;