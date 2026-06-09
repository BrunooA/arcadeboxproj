import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.rawg.io/api',
});

// Chave da API obtida em seu painel da RAWG
const API_KEY = 'ccc8ad2696cc41b2ab08ef2ad12686db'; 

export const gameService = {
  // Realiza a busca dinâmica ou traz os populares por padrão
  getGames: async (searchQuery = '') => {
    try {
      const endpoint = searchQuery 
        ? `/games?key=${API_KEY}&search=${searchQuery}&page_size=12`
        : `/games?key=${API_KEY}&page_size=12`;
      const response = await api.get(endpoint);
      return response.data.results;
    } catch (error) {
      console.error("Erro ao buscar jogos da RAWG:", error);
      throw error;
    }
  }
};

export default api;