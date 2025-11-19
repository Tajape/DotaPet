import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Image,
  FlatList, 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker'; 

// =========================================================================
// TIPOS E DADOS
// =========================================================================

type Gender = 'Macho' | 'Fêmea' | null;
type Size = 'pequeno' | 'médio' | 'grande' | null;
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]); 

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
  
  // --- Função de Submissão ---
  const handleSubmit = () => {
    if (!name || !age || !breed || !gender || !size || selectedImages.length === 0) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios e adicione pelo menos uma foto.');
      return;
    }
    
    console.log({
      name, age, color, breed, description, gender, size, totalImages: selectedImages.length,
      imageUris: selectedImages,
    });

    Alert.alert('Sucesso!', `${name} cadastrado com sucesso!`);
  };

  // =========================================================================
  // 2. COMPONENTES Auxiliares
  // =========================================================================

  // Componente para seleção de Sexo (Macho/Fêmea)
  const GenderOption: React.FC<{ label: Gender; icon: string }> = ({ label, icon }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        gender === label && styles.genderButtonSelected,
      ]}
      onPress={() => setGender(label)}
    >
      <Ionicons 
        name={icon as 'male' | 'female'} 
        size={30} 
        // 💡 MUDANÇA: Ícone preto quando selecionado, cinza quando não
        color={gender === label ? '#333' : '#666'} 
      />
      <Text style={[styles.genderLabel, gender === label && styles.genderLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Componente para seleção de Porte (Pequeno/Médio/Grande)
  const SizeOption: React.FC<{ label: Size }> = ({ label }) => (
    <TouchableOpacity
      style={[
        styles.sizeButton,
        size === label && styles.sizeButtonSelected,
      ]}
      onPress={() => setSize(label)}
    >
      <Text style={[styles.sizeLabel, size === label && styles.sizeLabelSelected]}>
        {label?.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

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
            keyboardType="numeric"
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
          
          {/* --- BOTÃO DE CADASTRAR (TEXTO PRETO) --- */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Cadastrar</Text>
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFC837', 
    paddingTop: Platform.OS === 'android' ? 40 : 15, 
  },
  backButton: { paddingRight: 15 },
  headerTitle: { 
      fontSize: 20, 
      fontWeight: '700', 
      color: '#333' 
  },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  },
  thumbnailImage: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      resizeMode: 'cover',
  },
  removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#FFF',
      borderRadius: 15,
      zIndex: 5,
  },
  imageCountTextMain: {
      textAlign: 'center',
      color: '#666',
      marginBottom: 30,
      fontWeight: '600',
  },

  // --- Input Fields ---
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF' },
  textArea: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF', minHeight: 100, textAlignVertical: 'top' },
  
  // --- Sexo ---
  genderContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, marginBottom: 20 },
  genderButton: { alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', minWidth: 120 },
  genderButtonSelected: { 
      backgroundColor: '#FFC837', 
      borderColor: '#FFC837', 
      shadowColor: '#FFC837', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 5, 
      elevation: 8 
  },
  genderLabel: { fontSize: 16, fontWeight: '600', marginTop: 5, color: '#333' },
  // 💡 MUDANÇA: Texto preto quando selecionado
  genderLabelSelected: { color: '#333' }, 

  // --- Porte ---
  sizeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 30 },
  sizeButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#CCC', minWidth: 90, alignItems: 'center' },
  sizeButtonSelected: { 
      backgroundColor: '#FFC837', 
      borderColor: '#FFC837' 
  },
  sizeLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  // 💡 MUDANÇA: Texto preto quando selecionado
  sizeLabelSelected: { color: '#333' },

  // --- Botão de Submissão ---
  submitButton: { 
      backgroundColor: '#FFC837', 
      borderRadius: 10, 
      paddingVertical: 15, 
      alignItems: 'center', 
      marginTop: 20, 
      marginBottom: 20 
  },
  // 💡 MUDANÇA: Texto preto
  submitButtonText: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      color: '#333' // Alterado de #FFF para #333
  },
});

export default RegisterPetScreen;