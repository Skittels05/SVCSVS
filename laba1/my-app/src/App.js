import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';
import BlogPage from './pages/BlogPage/BlogPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import roby from './images/roby.png';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
`;

const ThemeToggle = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const App = ({ toggleTheme }) => {
  return (
    <Router>
      <AppWrapper>
        <Header logo={roby} />
        <Main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Main>
        <Footer />
        <ThemeToggle onClick={toggleTheme}>
          {localStorage.getItem('theme') === 'dark' ? '☀️' : '🌙'}
        </ThemeToggle>
      </AppWrapper>
    </Router>
  );
};

export default App;