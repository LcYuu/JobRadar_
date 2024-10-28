// src/services/auth.js
export const loginUser = (userData) => {
    // Giả sử API login trả về thông tin người dùng
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  export const logoutUser = () => {
    localStorage.removeItem('user');
  };
  