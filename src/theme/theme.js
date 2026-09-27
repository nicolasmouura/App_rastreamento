// Fonte única de verdade pra cores, tipografia e espaçamento do app.

// Importa esse arquivo em vez de repetir hex codes em cada tela.

export const cores = {

  // Cor de ação principal (botões, destaques)
  primaria: '#0754D9',

  primariaEscura: '#003DB5',

  // Fundo e superfícies
  fundo: '#F4F8FF',

  superficie: '#FFFFFF',

  superficieAlternativa: '#EAF2FF',

  // Texto
  texto: '#102A43',

  textoSecundario: '#5B6B7A',

  textoSobrePrimaria: '#FFFFFF',

  // Bordas e divisores
  borda: '#D9E6F7',

  // Status (mantém significado semântico)
  online: '#16A085',

  offline: '#D64545',

  // Feedback
  erro: '#D64545',

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

export const sombra = {

  shadowColor: '#000',

  shadowOffset: { width: 0, height: 2 },

  shadowOpacity: 0.06,

  shadowRadius: 8,

  elevation: 2,

};