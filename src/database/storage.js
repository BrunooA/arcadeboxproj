import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ASYNC_STORAGE_KEY = '@arcadebox:games_v2';

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

export const storage = {
  getLibrary: async () => {
    try {
      const response = await getStorageItem(ASYNC_STORAGE_KEY);
      return response ? JSON.parse(response) : [];
    } catch (error) {
      return [];
    }
  },

  saveGame: async (game) => {
    try {
      const currentLibrary = await storage.getLibrary();
      // Remove se já existir para não duplicar no Create/Update
      const filtered = currentLibrary.filter(item => item.id !== game.id);
      const updatedLibrary = [...filtered, game];
      await setStorageItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedLibrary));
      return updatedLibrary;
    } catch (error) {
      throw error;
    }
  },

  removeGame: async (id) => {
    try {
      const currentLibrary = await storage.getLibrary();
      const updatedLibrary = currentLibrary.filter(game => game.id !== id);
      await setStorageItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedLibrary));
      return updatedLibrary;
    } catch (error) {
      throw error;
    }
  }
};