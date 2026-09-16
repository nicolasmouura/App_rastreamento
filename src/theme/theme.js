// Fonte única de verdade pra cores, tipografia e espaçamento do app.
// Importa esse arquivo em vez de repetir hex codes em cada tela.

export const cores = {
  // Cor de ação principal (botões, destaques)
  primaria: '#D64545',
  primariaEscura: '#B23636',

  // Fundo e superfícies
  fundo: '#FAFAF8',
  superficie: '#FFFFFF',
  superficieAlternativa: '#F1EEE9',

  // Texto
  texto: '#1F2A2E',
  textoSecundario: '#6B6F76',
  textoSobrePrimaria: '#FFFFFF',

  // Bordas e divisores
  borda: '#E4E1DA',

  // Status (mantém significado semântico)
  online: '#2E7D5B',
  offline: '#C0392B',

  // Feedback
  erro: '#C0392B',
};

export const fontes = {
  titulo: 'Poppins_700Bold',
  destaque: 'Poppins_600SemiBold',
  corpo: undefined, // usa a fonte padrão do sistema
};

export const raio = {
  pilula: 28,
  card: 16,
  botaoSecundario: 8,
};

export const espaco = {
  pequeno: 8,
  medio: 16,
  grande: 24,
  extraGrande: 32,
};

export const sombra = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};