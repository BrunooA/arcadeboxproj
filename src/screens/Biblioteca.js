import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { storage } from '../database/storage';
import { theme } from '../styles/themes';
import { Ionicons } from '@expo/vector-icons';

export default function Biblioteca() {
  const [jogos, setJogos] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const loadGames = async () => {
    const data = await storage.getLibrary();
    setJogos(data);
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleDelete = async (id) => {
    await storage.removeGame(id);
    loadGames();
  };

  // Aplica a lógica de filtragem local baseada na categoria selecionada
  const jogosFiltrados = jogos.filter(jogo => {
    if (filtroAtivo === 'Todos') return true;
    return jogo.status === filtroAtivo;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerWrapper} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="stats-chart" size={20} color={theme.colors.accent} style={{ marginRight: 8, transform: [{ rotate: '90deg' }] }} />
            <Text style={styles.headerTitle}>Minha <Text style={{ color: theme.colors.accent }}>Caixa</Text></Text>
          </View>
          <View style={styles.badgeOffline}>
            <Text style={styles.badgeOfflineText}>Offline ({jogos.length})</Text>
          </View>
        </View>

        {/* Filtros em Abas do Mockup */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsRow}>
          {['Todos', 'Quero Jogar', 'Jogando', 'Zerado'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.tabButton, filtroAtivo === cat && styles.tabButtonActive]} 
              onPress={() => setFiltroAtivo(cat)}
            >
              <Text style={[styles.tabButtonText, filtroAtivo === cat && styles.tabButtonTextActive]}>
                {cat === 'Quero Jogar' ? 'Quero' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={jogosFiltrados}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum game nesta categoria.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.boxCard}>
              <Image source={{ uri: item.background_image }} style={styles.boxCapa} />
              <View style={styles.boxContent}>
                <Text style={styles.boxName} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.metaRow}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={12} color={s <= item.rating ? "#FFD700" : "#2a354d"} style={{ marginRight: 2 }} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.boxActions}>
                <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={16} color={theme.colors.favorite} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerWrapper: { alignSelf: 'center', width: '100%', maxWidth: 450, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  badgeOffline: { backgroundColor: '#181e2b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOfflineText: { color: '#62697a', fontSize: 11, fontWeight: 'bold' },
  
  // Abas de Filtros
  filterTabsRow: { flexDirection: 'row', marginBottom: 20 },
  tabButton: { backgroundColor: '#111622', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#1f293d' },
  tabButtonActive: { backgroundColor: '#b026ff', borderColor: '#b026ff' },
  tabButtonText: { color: '#62697a', fontSize: 13, fontWeight: 'bold' },
  tabButtonTextActive: { color: '#0a0d14' },

  // Lista de itens salvos
  boxCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, padding: 10, alignItems: 'center' },
  boxCapa: { width: 55, height: 55, borderRadius: 8 },
  boxContent: { flex: 1, paddingHorizontal: 12 },
  boxName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusBadge: { backgroundColor: '#0c241a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  statusBadgeText: { color: '#00ce7a', fontSize: 10, fontWeight: 'bold' },
  starsContainer: { flexDirection: 'row' },
  boxActions: { flexDirection: 'row' },
  actionIconBtn: { padding: 8, backgroundColor: '#1c2333', borderRadius: 6, marginLeft: 4 },
  emptyText: { color: '#62697a', textAlign: 'center', marginTop: 30 }
});