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
  Dimensions, // Importar Dimensions para padding de segurança
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

  const router = useRouter();

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }
    Alert.alert('Sucesso', `Cadastro de ${name} efetuado!`);
  };

  const handleGoogleLogin = () => {
    console.log('Continuar com Google acionado!');
  };

  const handleFacebookLogin = () => {
    console.log('Continuar com Facebook acionado!');
  };

  const handleGoBack = () => {
    // router.back() é a forma correta de voltar usando Expo Router
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Garantimos que a barra de status esteja ok */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* --- Cabeçalho (Header) - Ajustado para visual limpo no topo --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastre-se</Text>
        {/* View VAZIA para forçar a centralização do título, mantendo a simetria */}
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* --- Container do Formulário e Ações --- */}
      {/* Usamos um ScrollView se o conteúdo for muito longo, mas o View basta aqui */}
      <View style={styles.contentContainer}>
        {/* Inputs... */}
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="insira aqui sua senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirme sua senha</Text>
        <TextInput
          style={styles.input}
          placeholder="insira aqui sua senha novamente"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* --- Botão Principal --- */}
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
          {/* Garante que o texto 'ou' está dentro de <Text> (já estava, mas reforçamos a estrutura) */}
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
// 4. ESTILOS (Ajustes de padding e fonte)
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
    // Adiciona um padding top para o conteúdo começar um pouco abaixo do header
    paddingTop: 10, 
  },

  // --- Cabeçalho (Header) - AJUSTES PARA VISUAL MAIS LIMPO E ESPAÇOSO ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,    // Mais respiro em cima
    paddingBottom: 25, // Mais respiro embaixo
    // Borda inferior opcional se quiser separar visualmente do formulário
    // borderBottomWidth: 1, 
    // borderBottomColor: '#eee',
  },
  backButton: {
    paddingRight: 10,
  },
  backButtonPlaceholder: {
    width: 24, 
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18, // REDUZIDO para 18px para ser mais sutil
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
    marginTop: 15, // Reduzido um pouco o padding para deixar mais compacto
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

  // --- Separador "ou" ---
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

  // --- Login Social ---
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