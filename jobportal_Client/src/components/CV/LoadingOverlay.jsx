import React from "react";

const LoadingOverlay = ({ isLoading, message = "Đang lưu...", scope = "container" }) => {
  if (!isLoading) return null;

  // Style chung cho overlay - luôn fixed để bao quát toàn màn hình
  const overlayStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: scope === "global" ? 9999 : 999
  };

  return (
    <div style={overlayStyle}>
      <div 
        className="flex flex-col items-center p-8 bg-white rounded-lg shadow-2xl"
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div 
          className="w-16 h-16 rounded-full"
          style={{
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderTopColor: '#8b5cf6',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p 
          className="mt-4 text-lg font-bold text-purple-600"
          style={{
            animation: 'pulse 2s infinite',
          }}
        >
          {message}
        </p>
      </div>
      
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay; 