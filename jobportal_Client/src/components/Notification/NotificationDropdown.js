import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead } from '../../redux/Notifications/notification.thunk';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { user } = useSelector((store) => store.auth);
  const { notifications, unreadCount } = useSelector((store) => store.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bellRef = useRef(null);

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchNotifications(user.userId));
      dispatch(fetchUnreadCount(user.userId));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const updatePosition = () => {
      if (bellRef.current && isOpen) {
        const rect = bellRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 5, // Dịch xuống dưới nút chuông 5px
          left: rect.left + window.scrollX, // Căn trái với nút chuông
        });
      }
    };

    updatePosition(); // Cập nhật ngay lập tức khi mở
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.notificationId));
      dispatch(fetchNotifications(user.userId));
      dispatch(fetchUnreadCount(user.userId));
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
        dispatch(fetchUnreadCount(user.userId));
      }
    }, 3000); 
  
    return () => clearInterval(interval);
  }, [dispatch, user]);

  const DropdownContent = (
    <div
      className="w-96 bg-white rounded-lg shadow-xl z-[999999] max-h-[85vh] overflow-hidden border border-gray-200"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
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
        {(!notifications || notifications.length === 0) ? (
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
  );

  return (
    <div className="relative inline-flex items-center" ref={bellRef}>
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

      {isOpen && createPortal(DropdownContent, document.body)}
    </div>
  );
};

export default NotificationDropdown;