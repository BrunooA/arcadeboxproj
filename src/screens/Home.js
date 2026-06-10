import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TextInput, ActivityIndicator, 
  SafeAreaView, ScrollView, TouchableOpacity, Image, Modal, Alert
} from 'react-native';
import { gameService } from '../services/api';
import { theme } from '../styles/themes';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../database/storage';

export default function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // ESTADOS FORMULÁRIO DO MODAL
  const [statusProgresso, setStatusProgresso] = useState('Quero Jogar');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notaEstrelas, setNotaEstrelas] = useState(5);
  const [anotacoes, setAnotacoes] = useState('');

  // INTEGRAÇÃO API: Executa a chamada do serviço Axios
  const fetchGames = async (query = '') => {
    setLoading(true);
    try {
      const data = await gameService.getGames(query);
      setGames(data);
    } catch (error) {
      console.error("Erro na busca da API RAWG:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleOpenSaveModal = () => {
    setModalVisible(true);
  };

  // OPERAÇÃO CRUD: [CREATE/UPDATE] - Envia os dados estruturados para o banco local
  const handleSaveToBox = async () => {
    if (!selectedGame) return;

    const gamePayload = {
      id: selectedGame.id.toString(),
      name: selectedGame.name,
      status: statusProgresso,
      rating: notaEstrelas,
      notes: anotacoes,
      background_image: selectedGame.background_image,
      genre: selectedGame.genres && selectedGame.genres.length > 0 ? selectedGame.genres[0].name : 'Ação',
      platform: selectedGame.platforms && selectedGame.platforms.length > 0 ? selectedGame.platforms[0].platform.name : 'PC'
    };

    await storage.saveGame(gamePayload);
    setModalVisible(false);
    setSelectedGame(null); // Reseta a pilha visual retornando para a busca
    
    // Limpa os campos do formulário para o próximo jogo não herdar os dados antigos
    setStatusProgresso('Quero Jogar');
    setNotaEstrelas(5);
    setAnotacoes(''); // Deixa o campo de anotações vazio de novo
    
    Alert.alert('Sucesso', 'Jogo salvo com sucesso na sua Caixa!');
  };

  // RENDERIZAÇÃO CONDICIONAL: Tela de Detalhes ricos (Ajustada dinamicamente)
  if (selectedGame) {
    // CORREÇÃO: Pega o primeiro gênero ou define um padrão
    const generoPrincipal = selectedGame.genres && selectedGame.genres.length > 0 ? selectedGame.genres[0].name : 'Estratégia';
    
    // Cria uma sinopse contextualizada automática para o jogo selecionado não ficar travado
    const sinopseDinamica = `Explore o universo incrível de ${selectedGame.name}. Um jogo eletrônico focado na categoria de ${generoPrincipal.toLowerCase()} que desafia os jogadores com mecânicas imersivas, escolhas marcantes e uma comunidade global de fãs. Lançado oficialmente pelo mercado de jogos em ${selectedGame.released || 'datas recentes'}.`;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centerWrapper}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGame(null)}>
            <Text style={styles.backButtonText}>← Voltar para Busca</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <Image source={{ uri: selectedGame.background_image }} style={styles.detailImage} />
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{selectedGame.name}</Text>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{selectedGame.metacritic || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.gradientButton} onPress={handleOpenSaveModal}>
            <Text style={styles.gradientButtonText}>+ Adicionar à Minha Caixa</Text>
          </TouchableOpacity>

          <View style={styles.fichaContainer}>
            <View style={styles.fichaRow}>
              <Text style={styles.fichaLabel}>Gênero Principal:</Text>
              <Text style={styles.fichaValue}>{generoPrincipal}</Text>
            </View>
            <View style={styles.fichaRow}>
              <Text style={styles.fichaLabel}>Lançamento:</Text>
              <Text style={styles.fichaValue}>{selectedGame.released || 'Não Informado'}</Text>
            </View>
            <Text style={styles.fichaLabelBlock}>Plataformas Disponíveis:</Text>
            <View style={styles.platformCapsuleContainer}>
              {/* CORREÇÃO DA IMAGEM image_c4ac5c.png: Mapeia as plataformas reais vindas da API da RAWG */}
              {selectedGame.platforms && selectedGame.platforms.length > 0 ? (
                selectedGame.platforms.map((p, i) => (
                  <View key={i} style={styles.platformCapsule}>
                    <Text style={styles.platformCapsuleText}>{p.platform.name}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.platformCapsule}><Text style={styles.platformCapsuleText}>Multiplataforma</Text></View>
              )}
            </View>
          </View>

          <Text style={styles.sinopseTitle}>SINOPSE</Text>
          {/* CORREÇÃO: Renderiza a sinopse personalizada gerada de acordo com o jogo clicado */}
          <Text style={styles.sinopseBody}>{sinopseDinamica}</Text>
        </ScrollView>

        {/* MODAL FORMULÁRIO DE PERSISTÊNCIA */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>SALVAR NA CAIXA</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#62697a" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalGameRow}>
                <Image source={{ uri: selectedGame.background_image }} style={styles.modalMiniCapa} />
                <View>
                  <Text style={styles.modalGameName}>{selectedGame.name}</Text>
                  <Text style={styles.modalGameId}>ID RAWG: {selectedGame.id}</Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>PROGRESSO</Text>
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

              <Text style={styles.inputLabel}>ANOTAÇÕES PESSOAIS</Text>
              <TextInput 
                style={styles.modalTextInput} 
                placeholder="Ex: Peguei em promoção, história maravilhosa!" 
                placeholderTextColor="#4e5564"
                value={anotacoes}
                onChangeText={setAnotacoes}
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveToBox}>
                  <Text style={styles.modalSaveBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // INTERFACE PADRÃO: Grid de Busca
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Ionicons name="game-controller" size={24} color={theme.colors.accent} style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>ArcadeBox</Text>
          </View>
          <View style={styles.badgeDescobrir}>
            <Text style={styles.badgeText}>Descobrir</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={theme.colors.accent} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Buscar na base RAWG..."
            placeholderTextColor="#62697a"
            value={search}
            onChangeText={(text) => { setSearch(text); fetchGames(text); }}
          />
        </View>

        <Text style={styles.sectionTitle}>JOGOS EM DESTAQUE</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={games}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ gap: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.rowCard} onPress={() => setSelectedGame(item)}>
                <Image source={{ uri: item.background_image }} style={styles.rowCardImage} />
                <View style={styles.rowCardContent}>
                  <View style={{ flex: 1, paddingRight: 5 }}>
                    <Text style={styles.rowGameTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rowGameRelease}>Lançamento: {item.released || '2022-02-25'}</Text>
                    <View style={styles.metaRowBadge}>
                      <Text style={styles.metaRowText}>Meta: {item.metacritic || 95}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerWrapper: { alignSelf: 'center', width: '100%', maxWidth: 1200, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: theme.colors.textHeader, fontSize: 24, fontWeight: 'bold' },
  badgeDescobrir: { backgroundColor: '#201530', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.purpleBadge },
  badgeText: { color: '#e5adff', fontSize: 12, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: '#1f293d', height: 46, marginBottom: 25 },
  searchIcon: { marginLeft: 15, marginRight: 10 },
  input: { flex: 1, color: theme.colors.textHeader, fontSize: 14 },
  sectionTitle: { color: '#62697a', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15 },
  rowCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1c2436', height: 95, flex: 1, minWidth: 280 },
  rowCardImage: { width: 95, height: 95 },
  rowCardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  rowGameTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  rowGameRelease: { color: '#62697a', fontSize: 11, marginTop: 2 },
  metaRowBadge: { backgroundColor: '#072419', borderWidth: 1, borderColor: theme.colors.metaGreen, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
  metaRowText: { color: theme.colors.metaGreen, fontSize: 11, fontWeight: 'bold' },
  backButton: { marginBottom: 15 },
  backButtonText: { color: theme.colors.textBody, fontSize: 13 },
  detailCard: { backgroundColor: theme.colors.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20 },
  detailImage: { width: '100%', height: 350 },
  detailTitleRow: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
  metaBadge: { backgroundColor: theme.colors.metaGreen, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  metaText: { color: '#0a0d14', fontWeight: 'bold', fontSize: 13 },
  gradientButton: { backgroundColor: '#00f0ff', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  gradientButtonText: { color: '#0a0d14', fontWeight: 'bold', fontSize: 15 },
  fichaContainer: { backgroundColor: theme.colors.surface, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20 },
  fichaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1c2436' },
  fichaLabel: { color: '#62697a', fontSize: 13 },
  fichaValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  fichaLabelBlock: { color: '#62697a', fontSize: 13, marginBottom: 8 },
  platformCapsuleContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  platformCapsule: { backgroundColor: '#0d111a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#1f293d', marginRight: 6, marginBottom: 6 },
  platformCapsuleText: { color: '#62697a', fontSize: 11, fontWeight: 'bold' },
  sinopseTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  sinopseBody: { color: theme.colors.textBody, fontSize: 13, lineHeight: 20 },
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