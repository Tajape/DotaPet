import { deleteDocument, getDocument, queryDocuments, setDocument } from '../firebase';
import { getCurrentUser } from './authService';

const FAVORITES_COLLECTION = 'favorites';

export const toggleFavorite = async (petId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const userId = user.uid;
    const docId = `${userId}_${petId}`;
    
    // Verifica se já está favoritado
    const existingFavorite = await getDocument(FAVORITES_COLLECTION, docId);
    
    if (existingFavorite) {
      // Remove dos favoritos
      await deleteDocument(FAVORITES_COLLECTION, docId);
      return false;
    } else {
      // Adiciona aos favoritos
      await setDocument(FAVORITES_COLLECTION, docId, {
        userId,
        petId,
        createdAt: new Date()
      });
      return true;
    }
  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
    throw error;
  }
};

export const getUserFavorites = async (): Promise<string[]> => {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const favorites = await queryDocuments(FAVORITES_COLLECTION, [
      { field: 'userId', operator: '==', value: user.uid }
    ]);
    
    return Array.isArray(favorites) ? favorites.map((fav: any) => fav.petId) : [];
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return [];
  }
};

export const getFavoritePets = async (): Promise<any[]> => {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    // Primeiro, busca os IDs dos pets favoritos
    const favoriteDocs = await queryDocuments(FAVORITES_COLLECTION, [
      { field: 'userId', operator: '==', value: user.uid }
    ]);
    
    if (!Array.isArray(favoriteDocs) || favoriteDocs.length === 0) return [];
    
    // Depois, busca os dados completos de cada pet favoritado
    const petPromises = favoriteDocs.map((fav: any) => 
      getDocument('pets', fav.petId)
    );
    
    const pets = await Promise.all(petPromises);
    return pets.filter(pet => pet !== null); // Remove possíveis nulos
  } catch (error) {
    console.error('Erro ao buscar pets favoritos:', error);
    return [];
  }
};

export const isPetFavorited = async (petId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const docId = `${user.uid}_${petId}`;
    const favorite = await getDocument(FAVORITES_COLLECTION, docId);
    return !!favorite;
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};
