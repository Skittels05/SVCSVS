import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import { loadAuthFromStorage } from './store/slices/authSlice';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

store.dispatch(loadAuthFromStorage());

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);