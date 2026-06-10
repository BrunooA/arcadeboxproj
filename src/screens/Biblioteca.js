import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // CORREÇÃO: Para atualizar a tela automaticamente ao clicar na aba
import { storage } from '../database/storage';
import { theme } from '../styles/themes';
import { Ionicons } from '@expo/vector-icons';

export default function Biblioteca() {
  const [jogos, setJogos] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  // ESTADOS PARA O MODAL DE EDIÇÃO (UPDATE)
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJogo, setSelectedJogo] = useState(null);
  const [statusProgresso, setStatusProgresso] = useState('Quero Jogar');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notaEstrelas, setNotaEstrelas] = useState(5);
  const [anotacoes, setAnotacoes] = useState('');

  // Carrega os games sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const loadGames = async () => {
        const data = await storage.getLibrary();
        setJogos(data);
      };
      loadGames();
    }, [])
  );

  // OPERAÇÃO CRUD: [DELETE] - Remove o item e atualiza o estado da lista
  const handleDelete = async (id) => {
    const updated = await storage.removeGame(id);
    setJogos(updated || []);
  };

  // OPERAÇÃO CRUD: [UPDATE] - Abre o modal carregando os dados atuais do jogo selecionado
  const handleOpenEditModal = (jogo) => {
    setSelectedJogo(jogo);
    setStatusProgresso(jogo.status || 'Quero Jogar');
    setNotaEstrelas(jogo.rating || 5);
    setAnotacoes(jogo.notes || '');
    setModalVisible(true);
  };

  // OPERAÇÃO CRUD: [UPDATE/SALVAR] - Grava as alterações de status/nota no storage
  const handleSaveChanges = async () => {
    if (!selectedJogo) return;

    const gamePayload = {
      ...selectedJogo,
      status: statusProgresso,
      rating: notaEstrelas,
      notes: anotacoes,
    };

    const updatedList = await storage.saveGame(gamePayload);
    setJogos(updatedList || []);
    setModalVisible(false);
    setSelectedJogo(null);
    Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
  };

  // LÓGICA DE FILTRAGEM
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

        {/* ABAS DE FILTRAGEM DINÂMICA */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsRow}>
          {['Todos', 'Quero Jogar', 'Jogando', 'Zerado'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tabButton, filtroAtivo === cat && styles.tabButtonActive]}
              onPress={() => setFiltroAtivo(cat)}
            >
              <Text style={[styles.tabButtonText, filtroAtivo === cat && styles.tabButtonTextActive]}>
                {cat} {/*Mantém o texto completo para o filtro funcionar com o banco */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RENDERIZAÇÃO DA BIBLIOTECA LOCAL */}
        <FlatList
          data={jogosFiltrados}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum game nesta categoria.</Text>
          }
          renderItem={({ item }) => (
            // Transformamos o card em um botão clicável para disparar o Modal de Edição (Update)
            <TouchableOpacity style={styles.boxCard} onPress={() => handleOpenEditModal(item)} activeOpacity={0.7}>
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
                {/* Botão de excluir contido e isolado para não chocar com o clique do card */}
                <TouchableOpacity style={styles.actionIconBtn} onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                  <Ionicons name="trash" size={16} color={theme.colors.favorite} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* MODAL DE EDIÇÃO DO PROGRESSO (OPERAÇÃO UPDATE) */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>GERENCIAR JOGO</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#62697a" />
              </TouchableOpacity>
            </View>

            {selectedJogo && (
              <View style={styles.modalGameRow}>
                <Image source={{ uri: selectedJogo.background_image }} style={styles.modalMiniCapa} />
                <View>
                  <Text style={styles.modalGameName}>{selectedJogo.name}</Text>
                  <Text style={styles.modalGameId}>Status Atual: {selectedJogo.status}</Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>ALTERAR PROGRESSO</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowDropdown(!showDropdown)}>
              <Text style={styles.dropdownTriggerText}>{statusProgresso}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
            
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {['Quero Jogar', 'Jogando', 'Zerado'].map((status) => (
                  <TouchableOpacity key={status} style={styles.dropdownItem} onPress={() => { setStatusProgresso(status); setShowDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.ratingSection}>
              <Text style={styles.inputLabel}>SUA NOTA</Text>
              <Text style={styles.ratingTextLabel}>{notaEstrelas} ESTRELAS</Text>
            </View>
            
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNotaEstrelas(star)}>
                  <Ionicons name={star <= notaEstrelas ? "star" : "star-outline"} size={26} color="#FFD700" style={{ marginRight: 12 }} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>ATUALIZAR ANOTAÇÕES</Text>
            <TextInput 
              style={styles.modalTextInput} 
              placeholder="Anotações sobre sua jornada..." 
              placeholderTextColor="#4e5564"
              value={anotacoes}
              onChangeText={setAnotacoes}
              multiline
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveChanges}>
                <Text style={styles.modalSaveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerWrapper: { alignSelf: 'center', width: '100%', maxWidth: 1200, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  badgeOffline: { backgroundColor: '#181e2b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOfflineText: { color: '#62697a', fontSize: 11, fontWeight: 'bold' },
  filterTabsRow: { flexDirection: 'row', marginBottom: 20 },
  tabButton: { backgroundColor: '#111622', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#1f293d' },
  tabButtonActive: { backgroundColor: '#b026ff', borderColor: '#b026ff' },
  tabButtonText: { color: '#62697a', fontSize: 13, fontWeight: 'bold' },
  tabButtonTextActive: { color: '#0a0d14' },
  boxCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, padding: 10, alignItems: 'center', flex: 1, minWidth: 280 },
  boxCapa: { width: 55, height: 55, borderRadius: 8 },
  boxContent: { flex: 1, paddingHorizontal: 12 },
  boxName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusBadge: { backgroundColor: '#0c241a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  statusBadgeText: { color: '#00ce7a', fontSize: 10, fontWeight: 'bold' },
  starsContainer: { flexDirection: 'row' },
  boxActions: { flexDirection: 'row' },
  actionIconBtn: { padding: 8, backgroundColor: '#1c2333', borderRadius: 6, marginLeft: 4 },
  emptyText: { color: '#62697a', textAlign: 'center', marginTop: 30 },
  
  // ESTILOS DO MODAL DE EDIÇÃO
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5, 7, 12, 0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: theme.colors.surface, width: '90%', maxWidth: 400, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2c1f3d' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  modalGameRow: { flexDirection: 'row', backgroundColor: '#0c101b', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  modalMiniCapa: { width: 45, height: 45, borderRadius: 6, marginRight: 12 },
  modalGameName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  modalGameId: { color: '#4e5564', fontSize: 11, marginTop: 2 },
  inputLabel: { color: '#62697a', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 8 },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0d14', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2c1f3d', marginBottom: 15 },
  dropdownTriggerText: { color: '#fff', fontSize: 14 },
  dropdownMenu: { backgroundColor: '#0a0d14', borderRadius: 8, borderWidth: 1, borderColor: '#2c1f3d', marginTop: -10, marginBottom: 15, overflow: 'hidden' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#111622' },
  dropdownItemText: { color: '#fff', fontSize: 13 },
  ratingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ratingTextLabel: { color: '#FFD700', fontSize: 11, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', marginBottom: 20 },
  modalTextInput: { backgroundColor: '#0a0d14', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1f293d', height: 70, textAlignVertical: 'top', fontSize: 13, marginBottom: 25 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c101b', borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#1f293d' },
  modalCancelBtnText: { color: '#62697a', fontWeight: 'bold' },
  modalSaveBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00f0ff', borderRadius: 8 },
  modalSaveBtnText: { color: '#0a0d14', fontWeight: 'bold' }
});