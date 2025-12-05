import { Dimensions, PixelRatio, ScaledSize } from 'react-native';

const { width, height } = Dimensions.get('window');

// Tamanhos de referência baseados no iPhone 11 (414x896)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// Breakpoints para diferentes tamanhos de tela
const BREAKPOINTS = {
  small: 375,    // iPhone SE, 5s, 5, etc.
  medium: 414,   // iPhone 11, XR, etc.
  large: 768,    // iPad Mini, iPad (9.7")
  xlarge: 1024,  // iPad Pro 10.5", 11"
};

// Obter as dimensões atuais da janela
const getWindowDimensions = (): ScaledSize => {
  return Dimensions.get('window');
};

// Função para dimensionamento horizontal baseado na largura da tela
// 🔧 Ajuste: nunca encolher abaixo do tamanho base em telefones
const horizontalScale = (size: number): number => {
  const { width: windowWidth } = getWindowDimensions();
  const factor = Math.max(windowWidth / BASE_WIDTH, 1); // mínimo 1x
  return factor * size;
};

// Função para dimensionamento vertical baseado na altura da tela
// 🔧 Ajuste: nunca encolher abaixo do tamanho base em telefones
const verticalScale = (size: number): number => {
  const { height: windowHeight } = getWindowDimensions();
  const factor = Math.max(windowHeight / BASE_HEIGHT, 1); // mínimo 1x
  return factor * size;
};

// Função para dimensionamento de fonte e elementos com fator de escala ajustável
const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (horizontalScale(size) - size) * factor;
};

// Verificar o tamanho da tela
const isSmallScreen = (): boolean => {
  const { width: windowWidth } = getWindowDimensions();
  return windowWidth < BREAKPOINTS.medium;
};

const isMediumScreen = (): boolean => {
  const { width: windowWidth } = getWindowDimensions();
  return windowWidth >= BREAKPOINTS.medium && windowWidth < BREAKPOINTS.large;
};

const isLargeScreen = (): boolean => {
  const { width: windowWidth } = getWindowDimensions();
  return windowWidth >= BREAKPOINTS.large;
};

// Função para obter o tipo de dispositivo baseado nas dimensões
const getDeviceType = (): 'phone' | 'tablet' | 'desktop' => {
  const { width: windowWidth } = getWindowDimensions();
  if (windowWidth >= BREAKPOINTS.large) {
    return 'tablet';
  }
  return 'phone';
};

// Função para obter o tamanho da fonte responsivo
// 🔧 Ajuste: fontes também não encolhem abaixo do tamanho base em telefones
const responsiveFontSize = (size: number): number => {
  const { width: windowWidth } = getWindowDimensions();
  const factor = Math.max(Math.min(windowWidth, BASE_WIDTH) / BASE_WIDTH, 1);
  const newSize = size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Função para obter padding/margin responsivo
const responsiveSpacing = (size: number): number => {
  return moderateScale(size);
};

export {
    BREAKPOINTS, getDeviceType, horizontalScale as hs, isLargeScreen, isMediumScreen, isSmallScreen, moderateScale as ms,
    responsiveFontSize as rfs,
    responsiveSpacing as rs, height as SCREEN_HEIGHT, width as SCREEN_WIDTH, verticalScale as vs
};

export default {
  hs: horizontalScale,
  vs: verticalScale,
  ms: moderateScale,
  rfs: responsiveFontSize,
  rs: responsiveSpacing,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getDeviceType,
  SCREEN_WIDTH: width,
  SCREEN_HEIGHT: height,
  BREAKPOINTS,
};

