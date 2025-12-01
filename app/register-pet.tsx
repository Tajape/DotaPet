import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDocument } from '../firebase';
import { getCurrentUser } from '../services/authService';

// =========================================================================
// TIPOS E DADOS
// =========================================================================

type Gender = 'Macho' | 'Fêmea' | null;
type Size = 'pequeno' | 'médio' | 'grande' | null;
type BooleanOption = boolean | null; 
const MAX_IMAGES = 5;

// =========================================================================
// 1. COMPONENTE PRINCIPAL (RegisterPetScreen)
// =========================================================================

const RegisterPetScreen = () => {
    const router = useRouter();

    // --- Estados do Formulário ---
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [color, setColor] = useState('');
    const [breed, setBreed] = useState('');
    const [description, setDescription] = useState('');
    const [gender, setGender] = useState<Gender>(null);
    const [size, setSize] = useState<Size>(null);
    const [isVaccinated, setIsVaccinated] = useState<BooleanOption>(null);
    const [isNeutered, setIsNeutered] = useState<BooleanOption>(null);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false); 

    // --- Funções de Imagem (Inalteradas) ---
    const handleImageUpload = async () => {
        if (selectedImages.length >= MAX_IMAGES) {
            Alert.alert('Limite Atingido', `Você pode adicionar no máximo ${MAX_IMAGES} fotos.`);
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: Platform.OS === 'ios',
            selectionLimit: MAX_IMAGES - selectedImages.length,
            quality: 0.7,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            
            setSelectedImages(prev => {
                const updatedList = [...prev, ...newImages];
                return updatedList.slice(0, MAX_IMAGES);
            });
        }
    };
    
    const removeImage = (uriToRemove: string) => {
        setSelectedImages(prev => prev.filter(uri => uri !== uriToRemove));
    };
    
    // --- Função de Submissão com Firebase ---
    const handleSubmit = async () => {
        if (!name || !age || !breed || !gender || !size || isVaccinated === null || isNeutered === null || selectedImages.length === 0) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios e adicione pelo menos uma foto.');
            return;
        }
        
        setIsLoading(true);
        try {
            const user = getCurrentUser();
            if (!user) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }

            await addDocument('pets', {
                name,
                age: parseInt(age),
                color,
                breed,
                description,
                gender,
                size,
                isVaccinated,
                isNeutered,
                images: selectedImages,
                ownerId: user.uid,
                createdAt: new Date(),
            });

            Alert.alert('Sucesso!', `${name} cadastrado com sucesso!`);
            router.replace('/(tabs)' as never);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao cadastrar pet.');
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================================
    // 2. COMPONENTES Auxiliares
    // =========================================================================

    // Componente para seleção de Sexo (Macho/Fêmea)
    const GenderOption: React.FC<{ label: Gender; icon: string }> = ({ label, icon }) => {
        const isSelected = gender === label;
        // 💡 MUDANÇA: Cor do ícone agora é '#333' quando selecionado (dark)
        const iconColor = isSelected ? '#333' : '#666'; 

        const handlePress = () => {
            setGender(isSelected ? null : label);
        };

        return (
            <TouchableOpacity
                style={[
                    styles.genderButton,
                    // Mantém o background amarelo no selecionado
                    isSelected && styles.genderButtonSelected, 
                ]}
                onPress={handlePress}
            >
                <Ionicons 
                    name={icon as 'male' | 'female'} 
                    size={30} 
                    color={iconColor} 
                />
                <Text 
                    style={[
                        styles.genderLabel, 
                        // 💡 MUDANÇA: Texto selecionado agora é '#333' (dark)
                        isSelected && { color: '#333', fontWeight: '700' } 
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Componente para seleção de Porte (Pequeno/Médio/Grande)
    const SizeOption: React.FC<{ label: Size }> = ({ label }) => {
        const isSelected = size === label;

        const handlePress = () => {
            setSize(isSelected ? null : label);
        };

        return (
            <TouchableOpacity
                style={[
                    styles.sizeButton,
                    isSelected && styles.sizeButtonSelected,
                ]}
                onPress={handlePress}
            >
                <Text 
                    style={[
                        styles.sizeLabel, 
                        // 💡 MUDANÇA: Texto selecionado agora é '#333' e sem .toUpperCase()
                        isSelected && { color: '#333', fontWeight: '700' }
                    ]}
                >
                    {label} 
                </Text>
            </TouchableOpacity>
        );
    };

    // Componente: Opção de Alternância (Sim/Não) para Vacinação e Castração
    const ToggleOption: React.FC<{ 
        label: string; 
        currentValue: BooleanOption; 
        onValueChange: (value: BooleanOption) => void;
    }> = ({ label, currentValue, onValueChange }) => {
        
        // 💡 MUDANÇA: Definição das cores escuras para SIM e NÃO
        const darkGreen = styles.darkGreen.backgroundColor;
        const darkRed = styles.darkRed.backgroundColor;

        // Estilos dinâmicos para SIM
        const getSimStyle = (isSelected: boolean) => ({
            backgroundColor: isSelected ? darkGreen : '#FFF',
            borderColor: isSelected ? darkGreen : '#EEE',
            color: isSelected ? '#FFF' : '#666', // Texto branco se selecionado
        });

        // Estilos dinâmicos para NÃO
        const getNaoStyle = (isSelected: boolean) => ({
            backgroundColor: isSelected ? darkRed : '#FFF',
            borderColor: isSelected ? darkRed : '#EEE',
            color: isSelected ? '#FFF' : '#666', // Texto branco se selecionado
        });

        return (
            <View style={styles.toggleContainer}>
                <Text style={styles.inputLabel}>{label}</Text>
                <View style={styles.toggleButtonsCentered}> 
                    {/* Botão SIM */}
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            { 
                                backgroundColor: getSimStyle(currentValue === true).backgroundColor,
                                borderColor: getSimStyle(currentValue === true).borderColor,
                                ...((currentValue === true) && styles.toggleButtonShadow)
                            },
                        ]}
                        onPress={() => onValueChange(currentValue === true ? null : true)}
                    >
                        <Text style={[
                            styles.toggleButtonText, 
                            { color: getSimStyle(currentValue === true).color }
                        ]}>
                            <Ionicons 
                                name="checkmark-circle" 
                                size={16} 
                                color={getSimStyle(currentValue === true).color} 
                            /> Sim
                        </Text>
                    </TouchableOpacity>

                    {/* Botão NÃO */}
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            { 
                                backgroundColor: getNaoStyle(currentValue === false).backgroundColor,
                                borderColor: getNaoStyle(currentValue === false).borderColor,
                                ...((currentValue === false) && styles.toggleButtonShadow)
                            },
                        ]}
                        onPress={() => onValueChange(currentValue === false ? null : false)}
                    >
                        <Text style={[
                            styles.toggleButtonText, 
                            { color: getNaoStyle(currentValue === false).color }
                        ]}>
                            <Ionicons 
                                name="close-circle" 
                                size={16} 
                                color={getNaoStyle(currentValue === false).color} 
                            /> Não
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderImageItem = ({ item }: { item: string }) => (
        <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item }} style={styles.thumbnailImage} />
            <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(item)}
            >
                <Ionicons name="close-circle" size={20} color="#333" />
            </TouchableOpacity>
        </View>
    );

    // =========================================================================
    // 3. RENDERIZAÇÃO
    // =========================================================================

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* ------------------ CABEÇALHO ------------------ */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" /> 
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cadastre seu pet!</Text> 
            </View>

            {/* ------------------ FORMULÁRIO SCROLLABLE ------------------ */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    
                    {/* Área de Imagem */}
                    <Text style={styles.imageInstruction}>
                        Insira uma ou mais imagens de seu pet (Máx. {MAX_IMAGES}):
                    </Text>
                    
                    <View style={styles.imageSelectionArea}>
                        {selectedImages.length === 0 ? (
                            <TouchableOpacity 
                                style={styles.imagePlaceholder}
                                onPress={handleImageUpload}
                            >
                                <Ionicons name="paw" size={70} color="#AAA" />
                                <Ionicons name="add-circle" size={30} color="#FFC837" style={styles.addIcon} />
                            </TouchableOpacity>
                        ) : (
                            <FlatList
                                data={selectedImages}
                                renderItem={renderImageItem}
                                keyExtractor={(item, index) => item + index}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.thumbnailList}
                            />
                        )}
                        
                        {selectedImages.length > 0 && selectedImages.length < MAX_IMAGES && (
                                <TouchableOpacity style={styles.floatingAddButton} onPress={handleImageUpload}>
                                    <Ionicons name="add" size={24} color="#333" />
                                </TouchableOpacity>
                        )}
                    </View>
                    
                    <Text style={styles.imageCountTextMain}>
                        {selectedImages.length} de {MAX_IMAGES} fotos adicionadas
                    </Text>

                    {/* --- INPUTS DE TEXTO --- */}
                    
                    <Text style={styles.inputLabel}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Rex, Luna, Bartolomeu..." 
                        value={name}
                        onChangeText={setName}
                    />
                    
                    <Text style={styles.inputLabel}>Idade</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 2 anos, 8 meses" 
                        value={age}
                        onChangeText={setAge}
                        keyboardType="default"
                    />
                    
                    <Text style={styles.inputLabel}>Cor</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Preto, Branco, Caramelo" 
                        value={color}
                        onChangeText={setColor}
                    />

                    <Text style={styles.inputLabel}>Raça</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Labrador, Siamês, SRD" 
                        value={breed}
                        onChangeText={setBreed}
                    />

                    <Text style={styles.inputLabel}>Descrição</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Conte sobre a personalidade, histórico, e necessidades do animal. (Máx. 500 caracteres)" 
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        numberOfLines={4}
                    />

                    {/* --- SELEÇÃO DE SEXO --- */}
                    <Text style={styles.inputLabel}>Sexo</Text>
                    <View style={styles.genderContainer}>
                        <GenderOption label="Macho" icon="male" />
                        <GenderOption label="Fêmea" icon="female" />
                    </View>

                    {/* --- SELEÇÃO DE PORTE --- */}
                    <Text style={styles.inputLabel}>Porte do animal</Text>
                    <View style={styles.sizeContainer}>
                        <SizeOption label="pequeno" />
                        <SizeOption label="médio" />
                        <SizeOption label="grande" />
                    </View>

                    {/* --- SELEÇÃO DE VACINAÇÃO --- */}
                    <ToggleOption
                        label="O pet é vacinado?"
                        currentValue={isVaccinated}
                        onValueChange={setIsVaccinated}
                    />
                    
                    {/* --- SELEÇÃO DE CASTRAÇÃO --- */}
                    <ToggleOption
                        label="O pet é castrado?"
                        currentValue={isNeutered}
                        onValueChange={setIsNeutered}
                    />
                    
                    {/* --- BOTÃO DE CADASTRAR --- */}
                    <TouchableOpacity 
                        style={[styles.submitButton, isLoading && { opacity: 0.6 }]} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#5a5a5aff" />
                        ) : (
                            <Text style={[styles.submitButtonText, { color: '#5a5a5aff' }]}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// =========================================================================
// 4. ESTILIZAÇÃO
// =========================================================================

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#FFC837', 
        paddingTop: Platform.OS === 'android' ? 40 : 15, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    backButton: { paddingRight: 15 },
    headerTitle: { 
        fontSize: 22,
        fontWeight: '800',
        color: '#333' 
    },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    container: { paddingHorizontal: 20, paddingTop: 20 },
    
    // --- CORES ESCURAS PARA TOGGLE ---
    darkGreen: { backgroundColor: '#69e286ff' }, // Verde Escuro
    darkRed: { backgroundColor: '#ec6e7bff' },   // Vermelho Escuro

    // --- Imagem ---
    imageInstruction: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    imageSelectionArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        position: 'relative',
        minHeight: 100,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E9E9E9',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#CCC',
        borderStyle: 'dashed',
    },
    addIcon: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FFF',
        borderRadius: 15,
    },
    floatingAddButton: {
        backgroundColor: '#FFC837',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 15,
        top: '50%',
        marginTop: -22.5,
        zIndex: 10,
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    thumbnailList: {
        paddingHorizontal: 10,
    },
    thumbnailContainer: {
        width: 100,
        height: 100,
        marginRight: 15,
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFF',
        borderRadius: 15,
        zIndex: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    imageCountTextMain: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
        fontWeight: '600',
    },

    // --- Input Fields ---
    inputLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    textArea: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF', minHeight: 100, textAlignVertical: 'top', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    
    // --- Sexo ---
    genderContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, marginBottom: 20 },
    genderButton: { alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 2, borderColor: '#EEE', minWidth: 120, backgroundColor: '#FFF', justifyContent: 'center' },
    genderButtonSelected: { 
        backgroundColor: '#FFC837', // Amarelo
        borderColor: '#FFC837', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 5, 
        elevation: 8 
    },
    genderLabel: { fontSize: 16, fontWeight: '700', marginTop: 5, color: '#333' },
    
    // --- Porte ---
    sizeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 30 },
    sizeButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#DDD', minWidth: 90, alignItems: 'center', backgroundColor: '#FFF' },
    sizeButtonSelected: { 
        backgroundColor: '#FFC837', 
        borderColor: '#FFC837',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3, 
        elevation: 3,
    },
    sizeLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    // --- Toggle (Sim/Não) ---
    toggleContainer: {
        marginBottom: 20,
    },
    toggleButtonsCentered: { 
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginTop: 10,
    },
    toggleButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        backgroundColor: '#FFF',
        minWidth: 100,
        alignItems: 'center',
    },
    toggleButtonShadow: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 3, 
        elevation: 4,
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },

    // --- Botão de Submissão ---
    submitButton: { 
        backgroundColor: '#FFC837', 
        borderRadius: 10, 
        paddingVertical: 15, 
        alignItems: 'center', 
        marginTop: 20, 
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    submitButtonText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
    },
});

export default RegisterPetScreen;