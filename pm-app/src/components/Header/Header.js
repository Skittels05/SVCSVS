import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="app-header">
      <h1>{t('projectManagement')}</h1>
      <div className="language-switcher">
        <button 
          onClick={() => changeLanguage('ru')}
          className={i18n.language === 'ru' ? 'active' : ''}
        >
          RU
        </button>
        <button 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'active' : ''}
        >
          EN
        </button>
      </div>
    </header>
  );
};

export default Header;