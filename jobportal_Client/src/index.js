import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ErrorBoundary from './error';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isTokenExpired } from './utils/tokenUtils';
import Chatbot from './components/ChatBot/ChatBot';

let user = null;
try {
  const userData = localStorage.getItem('user');
  if (userData) {
    user = JSON.parse(userData);
  }
} catch (error) {
  console.error('Error parsing user from localStorage:', error);
  localStorage.removeItem('user');
  user = null;
}

const checkTokenOnLoad = () => {
  const token = localStorage.getItem('jwt');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/auth/sign-in';
    return false;
  }
  return true;
};

if (checkTokenOnLoad()) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <App />
          {(user === null || (user && user.userType.userTypeId === 2)) && <Chatbot />}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}

reportWebVitals();