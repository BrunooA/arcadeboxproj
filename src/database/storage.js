import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ASYNC_STORAGE_KEY = '@arcadebox:games_v2';

// Abstração interna para suportar tanto o ambiente Web quanto Dispositivos Mobile nativos
const getStorageItem = async (key) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await AsyncStorage.getItem(key);
};

const setStorageItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
};

// EXPLICAR NA APRESENTAÇÃO: Objeto de serviço que encapsula o acesso à API de persistência local
export const storage = {
  
  // OPERAÇÃO CRUD: [READ LOCAL] - Lê a string JSON do banco, faz o parse e devolve um array limpo
  getLibrary: async () => {
    try {
      const response = await getStorageItem(ASYNC_STORAGE_KEY);
      return response ? JSON.parse(response) : [];
    } catch (error) {
      console.error("Erro ao ler banco local:", error);
      return [];
    }
  },

  // OPERAÇÃO CRUD: [CREATE & UPDATE] - Gerencia inserção e atualização de dados unificados no mesmo método
  saveGame: async (game) => {
    try {
      const currentLibrary = await storage.getLibrary();
      
      // Filtro de prevenção: Se o jogo já existir, remove a versão antiga para evitar duplicidade
      const filtered = currentLibrary.filter(item => item.id !== game.id);
      
      // Cria uma nova lista injetando o payload atualizado (Imutabilidade do estado)
      const updatedLibrary = [...filtered, game];
      
      // Gravação física dos dados serializados em formato de string texturizada
      await setStorageItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedLibrary));
      return updatedLibrary;
    } catch (error) {
      console.error("Erro ao salvar no banco local:", error);
      throw error;
    }
  },

  // OPERAÇÃO CRUD: [DELETE] - Remove um jogo específico baseado na comparação estrita do ID
  removeGame: async (id) => {
    try {
      const currentLibrary = await storage.getLibrary();
      
      // Gera um novo array contendo todos os jogos, exceto aquele com o ID correspondente
      const updatedLibrary = currentLibrary.filter(game => game.id !== id);
      
      await setStorageItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedLibrary));
      return updatedLibrary;
    } catch (error) {
      console.error("Erro ao remover do banco local:", error);
      throw error;
    }
  }
};