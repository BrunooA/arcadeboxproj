import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../styles/themes';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../database/storage';

export default function GameCard({ item, onFavoriteAdded }) {
  
  // EXPLICAR NA APRESENTAÇÃO: Função assíncrona que gerencia o clique no botão de favoritar/adicionar à Caixa
  const handleFavoritePress = async () => {
    try {
      // Montagem do payload unificado com tratamento para dados nulos vindos da API
      const gameData = {
        id: item.id.toString(), // Garante que o ID seja salvo como String para evitar conflitos de busca
        name: item.name,
        genre: item.genres && item.genres.length > 0 ? item.genres[0].name : 'Ação',
        platform: item.platforms && item.platforms.length > 0 ? item.platforms[0].platform.name : 'Multi',
        rating: item.rating || 0,
        background_image: item.background_image,
        status: 'Quero Jogar' // Status padrão inicial quando adicionado de forma rápida via card
      };

      // OPERAÇÃO CRUD: [CREATE] - Envia os dados estruturados para persistência na camada de storage
      await storage.saveGame(gameData);
      Alert.alert("Sucesso", `"${item.name}" foi salvo em sua Caixa!`);
      
      // Callback para atualizar a listagem da biblioteca automaticamente caso ela esteja em segundo plano
      if (onFavoriteAdded) onFavoriteAdded();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar jogo.");
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.background_image }} style={styles.cardImage} resizeMode="cover" />
      <div style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.gameTitle} numberOfLines={1}>{item.name}</Text>
          {item.genres && item.genres.length > 0 && (
            <Text style={styles.gameGenre}>{item.genres[0].name}</Text>
          )}
        </View>
        <View style={styles.rightActions}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.rating ? item.rating.toFixed(1) : '4.5'}</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
            <Ionicons name="heart" size={20} color={theme.colors.favorite} />
          </TouchableOpacity>
        </View>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoContainer: { flex: 1, marginRight: 8 },
  gameTitle: { color: theme.colors.textHeader, fontSize: 16, fontWeight: 'bold' },
  gameGenre: { color: theme.colors.textBody, fontSize: 12, marginTop: 2 },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  ratingBadge: { backgroundColor: '#1c2333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  ratingText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
  favoriteButton: { backgroundColor: '#1c2333', padding: 6, borderRadius: 6 }
});