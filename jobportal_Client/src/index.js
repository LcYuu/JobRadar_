import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ErrorBoundary from "./error";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isTokenExpired } from './utils/tokenUtils';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
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
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

// Kiểm tra token hết hạn khi trang web được tải
const checkTokenOnLoad = () => {
  const token = localStorage.getItem('jwt');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/auth/sign-in';
  }
};

// Gọi hàm kiểm tra khi trang web được tải
checkTokenOnLoad();

reportWebVitals();
