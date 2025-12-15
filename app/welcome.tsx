import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Importa o hook de navegação do Expo Router
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// --- ATENÇÃO: CONFIGURAÇÃO DE IMAGENS LOCAIS ---
const logoImage = require('../assets/images/logoDotaPet.png');
// ------------------------------------------------

// =========================================================================
// 1. DEFINIÇÃO DAS INTERFACES (Tipagem para TypeScript)
// =========================================================================

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isPrimary?: boolean;
}

// =========================================================================
// 2. COMPONENTES AUXILIARES
// =========================================================================

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
    const router = useRouter(); 

    const handleEntrar = () => {
        console.log('Navegando para Login...');
        router.push('/login');
    };

    const handleCadastrar = () => {
        console.log('Navegando para Cadastro...');
        router.push('/register'); 
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
});

export default TelaOpcoes;