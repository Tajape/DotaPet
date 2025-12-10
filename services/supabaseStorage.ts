import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabaseClient';

const BUCKET_NAME = 'pets';

export const uploadPetImage = async (uri: string, userId: string): Promise<string> => {
  try {
    if (!uri) {
      throw new Error('URI da imagem inválida');
    }

    // Garante uma URI de arquivo válida
    let fileUri = uri;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      fileUri = uri;
    }

    // Define extensão e caminho do arquivo no bucket
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Lê o arquivo como base64 usando a API legacy (sem warnings)
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    if (!base64) {
      throw new Error('Não foi possível ler o arquivo de imagem');
    }

    // Converte base64 em ArrayBuffer aceito pelo Supabase
    const fileData = decode(base64);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileData, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });

    if (error) {
      console.error('[Supabase] Erro ao fazer upload da imagem:', error);
      throw error;
    }

    if (!data?.path) {
      throw new Error('Upload no Supabase não retornou caminho do arquivo');
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error('Não foi possível obter URL pública da imagem');
    }

    return publicData.publicUrl;
  } catch (error) {
    console.error('[Supabase] Erro geral ao processar upload da imagem:', error);
    throw error;
  }
};

export const uploadUserImage = async (uri: string, userId: string): Promise<string> => {
  try {
    if (!uri) {
      throw new Error('URI da imagem inválida');
    }

    let fileUri = uri;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      fileUri = uri;
    }

    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    if (!base64) {
      throw new Error('Não foi possível ler o arquivo de imagem');
    }

    const fileData = decode(base64);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileData, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });

    if (error) {
      console.error('[Supabase] Erro ao fazer upload da imagem de usuário:', error);
      throw error;
    }

    if (!data?.path) {
      throw new Error('Upload no Supabase não retornou caminho do arquivo');
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error('Não foi possível obter URL pública da imagem de usuário');
    }

    return publicData.publicUrl;
  } catch (error) {
    console.error('[Supabase] Erro geral ao processar upload da imagem de usuário:', error);
    throw error;
  }
};
