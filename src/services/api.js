import axios from 'axios';

// Instanciação base configurada com o endpoint raiz do serviço de dados
const api = axios.create({
  baseURL: 'https://api.rawg.io/api',
});

const API_KEY = 'ccc8ad2696cc41b2ab08ef2ad12686db'; 

export const gameService = {
  //Função que unifica a busca padrão e o filtro por string textual usando endpoints dinâmicos
  getGames: async (searchQuery = '') => {
    try {
      const endpoint = searchQuery 
        ? `/games?key=${API_KEY}&search=${encodeURIComponent(searchQuery)}&page_size=12`
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