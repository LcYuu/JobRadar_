import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`http://localhost:8080/seeker/notifications/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Response was not JSON");
      }
      
      const data = await response.json();
      const unreadNotifications = data.filter(notification => !notification.isRead);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`http://localhost:8080/seeker/unread-count/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Response was not JSON");
      }
      
      const count = await response.json();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        const response = await fetch(`http://localhost:8080/seeker/read/${notification.notificationId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchNotifications();
          await fetchUnreadCount();
        } else {
          console.error('Failed to mark notification as read:', response.status);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  
    const path = notification.redirectUrl.startsWith('http') 
      ? new URL(notification.redirectUrl).pathname 
      : notification.redirectUrl;
    
    navigate(path);
    setIsOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.userId) {
        fetchUnreadCount();
      }
    }, 3000); 
  
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="relative inline-flex items-center">
      <Button
        variant="ghost"
        className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed right-4 top-16 w-96 bg-white rounded-lg shadow-xl z-[999] max-h-[85vh] overflow-hidden border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-4rem)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50
                      ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {notification.title}
                        </p>
                        <div className="text-gray-600 text-sm space-y-1">
                          {notification.content.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          {format(new Date(notification.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;