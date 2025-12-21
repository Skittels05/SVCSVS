import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import App from './App';
import { lightTheme, darkTheme } from './theme';
import { useState, useEffect } from 'react';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 10px;

    @media (max-width: 320px) {
      font-size: 8px;
    }
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-size: 1.8rem;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

function Root() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? darkTheme : lightTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme === darkTheme ? 'dark' : 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App toggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);