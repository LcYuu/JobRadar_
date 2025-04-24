import React, { createContext, useState, useContext } from "react";

export const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  loadingMessage: "",
  setLoadingMessage: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");

  const startLoading = (message = "Đang tải...") => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingMessage,
        setLoadingMessage,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext); 