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
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; 

// --- ATENÇÃO: IMPORTAÇÃO DAS IMAGENS/ÍCONES ---
const googleIconSource = require('../assets/images/icone-google.png');
const facebookIconSource = require('../assets/images/icone-facebook.png');
// ------------------------------------------------

// =========================================================================
// 1. COMPONENTES DE ÍCONES (Imagens Locais)
// =========================================================================

const GoogleIcon = () => (
  <Image source={googleIconSource} style={styles.socialIconImage} />
);

const FacebookIcon = () => (
  <Image source={facebookIconSource} style={styles.socialIconImage} />
);

// =========================================================================
// 2. INTERFACES E COMPONENTE REUTILIZÁVEL (SocialButton)
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
// 3. COMPONENTE PRINCIPAL (RegisterScreen)
// =========================================================================

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 🎯 NOVOS ESTADOS para controlar a visibilidade da senha
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const router = useRouter();

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }
    
    console.log('Dados de Cadastro:', { name, email, password });
    // Navegação para a Home/Login aqui.
  };

  const handleGoogleLogin = () => {
    console.log('Continuar com Google acionado!');
  };

  const handleFacebookLogin = () => {
    console.log('Continuar com Facebook acionado!');
  };

  const handleGoBack = () => {
    router.back();
  };

  // 🎯 COMPONENTE REUTILIZÁVEL PARA INPUT DE SENHA COM OLHO
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

      {/* --- Cabeçalho CUSTOMIZADO --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastre-se</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* --- Container do Formulário e Ações --- */}
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

        {/* 🎯 Input: Senha COM OLHINHO */}
        <PasswordInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="insira aqui sua senha"
          isVisible={isPasswordVisible}
          toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
        />

        {/* 🎯 Input: Confirme sua senha COM OLHINHO */}
        <PasswordInput
          label="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="insira aqui sua senha novamente"
          isVisible={isConfirmPasswordVisible}
          toggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        />

        {/* --- Botão Principal (Entrar/Cadastrar) --- */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* --- Separador "ou" --- */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* --- Botões de Login Social --- */}
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
    </SafeAreaView>
  );
};

// =========================================================================
// 4. ESTILOS (Ajustes para o Olhinho)
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
    paddingTop: 10,
  },

  // --- Cabeçalho ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44, 
    height: 44,
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },

  // --- Formulário (Inputs) ---
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
    // Não precisa de margem inferior extra aqui
  },
  
  // 🎯 NOVOS ESTILOS PARA INPUT COM SENHA
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
    flex: 1, // Permite que o campo ocupe todo o espaço menos o ícone
    paddingHorizontal: 15,
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 15, // Espaçamento para o toque
    height: '100%',
    justifyContent: 'center',
  },
  // ------------------------------------

  // --- Botão Principal ---
  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#FFC837',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // --- Separador e Social Login (Manter) ---
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

export default RegisterScreen;