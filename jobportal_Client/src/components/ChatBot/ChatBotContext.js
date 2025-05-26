import { createContext, useContext } from 'react';

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  return <ChatbotContext.Provider value={{ restrictedPaths: ['/auth/sign-in', '/auth/sign-up',
     '/auth/forgot-password', '/change-password', '/user/account-management', '/role-selection'] }}>{children}</ChatbotContext.Provider>;
};