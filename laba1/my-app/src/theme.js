export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1920px',
};

export const lightTheme = {
  colors: {
    primary: '#000000',
    background: '#ffffff',
    text: '#747474',
    accent: '#000000',
    hr: '#ffffff',
    cardBorder: '#000000',
    factSelected: 'rgba(0, 0, 0, 0.1)',
  },
  fontSizes: {
    huge: '6rem',
    large: '4.8rem',
    medium: '2rem',
    normal: '1.9rem',
    small: '1.5rem',
  },
  spacing: {
    section: '12rem',
    large: '10rem',
    medium: '5rem',
    small: '2rem',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#ffffff',
    background: '#0a0a0a',
    text: '#cccccc',
    accent: '#ffffff',
    hr: '#444444',
    cardBorder: '#ffffff',
    factSelected: 'rgba(255, 255, 255, 0.1)',
  },
};