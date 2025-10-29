import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';

// Importa o hook de navegação do Expo Router
import { useRouter } from 'expo-router'; 

const { width } = Dimensions.get('window');

// --- ATENÇÃO: CONFIGURAÇÃO DE IMAGENS LOCAIS ---
// Certifique-se de que os caminhos abaixo (assets/images/...) estão corretos no seu projeto.
// Se você estiver usando SVGs, substitua 'require(...)' pelo componente SVG importado,
// como discutimos anteriormente.
const logoImage = require('../assets/images/logoDotaPet.png');
const googleIcon = require('../assets/images/icone-google.png');
const facebookIcon = require('../assets/images/icone-facebook.png');
// ------------------------------------------------

// =========================================================================
// 1. DEFINIÇÃO DAS INTERFACES (Tipagem para TypeScript)
// =========================================================================

interface SocialButtonProps {
  iconSource: ImageSourcePropType;
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isPrimary?: boolean;
}

// =========================================================================
// 2. COMPONENTES AUXILIARES
// =========================================================================

// Componente do Botão Social (Google/Facebook)
const SocialButton: React.FC<SocialButtonProps> = ({ iconSource, title, onPress, style }) => (
  <TouchableOpacity style={[styles.socialButton, style]} onPress={onPress}>
    <Image source={iconSource} style={styles.socialIcon} />
    <Text style={styles.socialButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Componente do Botão Primário (Entrar/Cadastrar)
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, isPrimary = true }) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      isPrimary ? styles.buttonEntrar : styles.buttonCadastrar,
    ]}
    onPress={onPress}>
    <Text
      style={[
        styles.primaryButtonText,
        isPrimary ? styles.textEntrar : styles.textCadastrar,
      ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// =========================================================================
// 3. COMPONENTE PRINCIPAL (TelaOpcoes)
// =========================================================================

const TelaOpcoes = () => {
    // 🎯 CORREÇÃO DE BUG: Inicializa o hook de navegação AQUI
    const router = useRouter(); 

    const handleEntrar = () => {
        console.log('Navegando para Login...');
        // Navega para a rota definida pelo arquivo app/login.tsx
        router.push('/login');
    };

    const handleCadastrar = () => {
        console.log('Navegando para Cadastro...');
        // Navega para a rota que criaremos em seguida (app/register.tsx)
        //router.push('/register'); 
    };

    const handleGoogleLogin = () => {
        console.log('Ação: Continuar com Google');
    };

    const handleFacebookLogin = () => {
        console.log('Ação: Continuar com Facebook');
    };

    return (
        <View style={styles.container}>
            {/* Área do Logo e Nome do Aplicativo */}
            <View style={styles.logoArea}>
                <Image source={logoImage} style={styles.logo} resizeMode="contain" />
                <Text style={styles.appName}>DotaPet</Text>
            </View>

            {/* Área dos Botões de Ação Principal */}
            <View style={styles.mainActionsArea}>
                <PrimaryButton
                    title="Entrar"
                    onPress={handleEntrar}
                    isPrimary={true}
                />
                <PrimaryButton
                    title="Cadastrar"
                    onPress={handleCadastrar}
                    isPrimary={false}
                />
            </View>

            {/* Separador "ou" */}
            <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou</Text>
                <View style={styles.separatorLine} />
            </View>

            {/* Área dos Botões de Login Social */}
            <View style={styles.socialLoginArea}>
                <SocialButton
                    iconSource={googleIcon}
                    title="Continuar com Google"
                    onPress={handleGoogleLogin}
                    style={styles.socialButtonGoogle} 
                />
                <SocialButton
                    iconSource={facebookIcon}
                    title="Continuar com Facebook"
                    onPress={handleFacebookLogin}
                    style={styles.socialButtonFacebook} 
                />
            </View>
        </View>
    );
};

// =========================================================================
// 4. ESTILOS
// =========================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff', 
        paddingHorizontal: 30, 
        paddingTop: 80, 
        alignItems: 'center', 
    },
    logoArea: {
        marginBottom: 80, 
        alignItems: 'center',
    },
    logo: {
        width: 150, 
        height: 150, 
    },
    appName: {
        fontSize: 34,
        fontWeight: '300', 
        color: '#333',
        marginTop: 10,
    },
    mainActionsArea: {
        width: '100%', 
        marginBottom: 40, 
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 5, 
        marginBottom: 15, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonEntrar: {
        backgroundColor: '#FFC837', 
        borderWidth: 1,
        borderColor: '#FFC837',
    },
    buttonCadastrar: {
        backgroundColor: '#fff', 
        borderWidth: 1,
        borderColor: '#AAAAAA', 
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    textEntrar: {
        color: '#333',
    },
    textCadastrar: {
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
    socialButtonGoogle: {
        // Estilo específico
    },
    socialButtonFacebook: {
        // Estilo específico
    },
    socialIcon: {
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

export default TelaOpcoes;