// src/components/Header//AvatarMenu.jsx
import React from 'react';
import './AvatarMenu.css';

const AvatarMenu = ({ user }) => {
  return (
    <div className="avatar-menu">
      <img className="avatar" src={user.avatarUrl || '/path/to/default-avatar.png'} alt="User Avatar" />
      <span className="welcome-text">Welcome, {user.username}</span>
    </div>
  );
};

export default AvatarMenu;
