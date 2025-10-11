// 💜 Paleta de colores fría y oscura inspirada en morados
// Dedicada con amor para tu novia 💕

export const COLORS = {
  // Colores primarios morados
  primary: {
    main: '#8B5FBF',        // Morado principal elegante
    dark: '#6A4C93',        // Morado oscuro profundo
    light: '#B794F6',       // Morado claro suave
    pale: '#E9D5FF',        // Morado muy claro
    deep: '#553C9A'         // Morado muy oscuro
  },

  // Colores complementarios fríos
  secondary: {
    blue: '#4C6EF5',        // Azul frío vibrante
    blueLight: '#667EEA',   // Azul frío claro
    gray: '#2D3748',        // Gris frío oscuro
    grayMedium: '#4A5568',  // Gris frío medio
    white: '#FFFFFF'        // Blanco puro
  },

  // Gradientes principales
  gradients: {
    primary: 'linear-gradient(135deg, #8B5FBF 0%, #6A4C93 100%)',
    secondary: 'linear-gradient(135deg, #B794F6 0%, #8B5FBF 100%)',
    accent: 'linear-gradient(135deg, #4C6EF5 0%, #667EEA 100%)',
    background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 25%, #6A4C93 70%, #8B5FBF 100%)',
    card: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.9) 100%)',
    purple: 'linear-gradient(45deg, #8B5FBF 30%, #B794F6 90%)',
    deepPurple: 'linear-gradient(45deg, #6A4C93 30%, #8B5FBF 90%)',
    darkPurple: 'linear-gradient(45deg, #553C9A 30%, #6A4C93 90%)',
    bluePurple: 'linear-gradient(45deg, #4C6EF5 30%, #667EEA 90%)'
  },

  // Sombras con tonos morados
  shadows: {
    primary: '0 8px 25px rgba(139, 95, 191, 0.4)',
    secondary: '0 4px 15px rgba(183, 148, 246, 0.3)',
    accent: '0 6px 20px rgba(76, 110, 245, 0.3)',
    soft: '0 2px 10px rgba(139, 95, 191, 0.15)',
    medium: '0 10px 40px rgba(139, 95, 191, 0.2)',
    strong: '0 15px 50px rgba(139, 95, 191, 0.3)'
  },

  // Estados y acciones
  status: {
    success: '#B794F6',     // Morado claro para éxito
    warning: '#F6AD55',     // Naranja cálido para advertencias
    error: '#FC8181',       // Rojo suave para errores
    info: '#4C6EF5'         // Azul frío para información
  },

  // Transparencias
  alpha: {
    purple15: 'rgba(139, 95, 191, 0.15)',
    purple25: 'rgba(139, 95, 191, 0.25)',
    purple40: 'rgba(139, 95, 191, 0.4)',
    white95: 'rgba(255, 255, 255, 0.95)',
    white90: 'rgba(255, 255, 255, 0.9)',
    white80: 'rgba(255, 255, 255, 0.8)'
  }
};

// Funciones utilitarias para colores
export const getGradient = (type) => COLORS.gradients[type] || COLORS.gradients.primary;
export const getShadow = (type) => COLORS.shadows[type] || COLORS.shadows.primary;
export const getAlpha = (type) => COLORS.alpha[type] || COLORS.alpha.purple25;

export default COLORS;