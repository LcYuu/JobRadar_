import React, { createContext, useState, useCallback } from "react";
// Create the context
export const CVInfoContext = createContext({
  cvInfo: {},
  setCvInfo: () => {},
});

// Create a provider component
export const CVInfoProvider = ({ children }) => {
  const [cvInfo, setCvInfoState] = useState({});

  // Create a stable setter function with useCallback
  const setCvInfo = useCallback((value) => {
    if (typeof value === 'function') {
      setCvInfoState(prevState => {
        const newState = value(prevState);
        console.log("CVInfoContext: State updated", newState);
        return newState;
      });
    } else {
      console.log("CVInfoContext: State updated directly", value);
      setCvInfoState(value);
    }
  }, []);

  // Create a value object with the state and setter
  const value = {
    cvInfo,
    setCvInfo,
  };

  // Return the provider with the value
  return (
    <CVInfoContext.Provider value={value}>
      {children}
    </CVInfoContext.Provider>
  );
};

