import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image, // <--- Importante: Importar o componente Image
  ImageSourcePropType,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons'; 
// MaterialCommunityIcons foi removido, não é mais necessário para os botões sociais

// Define a largura da tela para uso em estilos responsivos
const { width } = Dimensions.get('window');

// --- ATENÇÃO: IMPORTAÇÃO DAS IMAGENS/ÍCONES ---
// Use os caminhos corretos para seus assets, assim como você fez no welcome.tsx
const googleIconSource = require('../assets/images/icone-google.png'); // Exemplo de caminho local
const facebookIconSource = require('../assets/images/icone-facebook.png'); // Exemplo de caminho local
// Se estivesse usando SVGs, você importaria os componentes SVG aqui.

// =========================================================================
// 1. CONSTANTES DE ÍCONES (AGORA USANDO IMAGEM)
// =========================================================================

// Componente para o Ícone do Google (Agora renderiza uma Imagem)
const GoogleIcon = () => (
  <Image source={googleIconSource} style={styles.socialIconImage} />
);

// Componente para o Ícone do Facebook (Agora renderiza uma Imagem)
const FacebookIcon = () => (
  <Image source={facebookIconSource} style={styles.socialIconImage} />
);

// =========================================================================
// 2. INTERFACES E COMPONENTES REUTILIZÁVEIS
// =========================================================================

// Interface para o SocialButton (Reutilizado da tela anterior)
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
    {/* Renderiza o componente de ícone, que agora é uma Imagem */}
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
  const router = useRouter();

  // --- Funções de Ação ---
  const handleLogin = () => {
    console.log('Tentativa de Login:', { email, password });
    // Lógica real de autenticação
  };

  const handleForgotPassword = () => {
    console.log('Navegar para Esqueceu Senha');
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

      {/* Cabeçalho Personalizado (Seta + Título) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bem vindo de volta!</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Campos de E-mail e Senha */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="insira aqui seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="insira aqui sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {/* Link Esqueci Minha Senha */}
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
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
            IconComponent={GoogleIcon} // Usando o componente de Imagem
            title="Continuar com Google"
            onPress={handleGoogleLogin}
          />
          <SocialButton
            IconComponent={FacebookIcon} // Usando o componente de Imagem
            title="Continuar com Facebook"
            onPress={handleFacebookLogin}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// =========================================================================
// 4. ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
    // ... (Estilos de SafeArea, Header, Input, etc. - Sem alteração)
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
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
    input: {
        height: 50,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
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
    // 🎯 NOVO ESTILO: Define o tamanho das imagens dos ícones sociais
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