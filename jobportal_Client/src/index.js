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
import { isTokenExpired } from "./utils/tokenUtils";
import {
  ChatbotProvider,
} from "./components/ChatBot/ChatBotContext";

// Lấy dữ liệu user từ localStorage
let user = null;
try {
  const userData = localStorage.getItem("user");
  if (userData) {
    user = JSON.parse(userData);
  }
} catch (error) {
  console.error("Lỗi khi parse user từ localStorage:", error);
  localStorage.removeItem("user");
}

// Kiểm tra token hợp lệ
const checkTokenOnLoad = () => {
  const token = localStorage.getItem("jwt");
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    window.location.href = "/auth/sign-in";
    return false;
  }
  return true;
};

// Render ứng dụng nếu token hợp lệ
if (checkTokenOnLoad()) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Provider store={store}>
      <ErrorBoundary>
        <ChatbotProvider>
          <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <App />
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
        </ChatbotProvider>
      </ErrorBoundary>
    </Provider>
  );
}

// Báo cáo hiệu suất
reportWebVitals();