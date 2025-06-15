import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../../redux/ChatBot/chatbot.thunk';
import { addUserMessage, clearError } from '../../redux/ChatBot/chatbotSlice';
import defaultAvatarImage from '../../assets/images/common/avatar.jpg';
import defaultBotImage from '../../assets/images/common/botavatar.png';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, loading, error } = useSelector((state) => state.chatbot);
  const authUser = useSelector((state) => state.auth.user);
  const messagesEndRef = useRef(null);
  const defaultAvatar = defaultAvatarImage;

  const userId = authUser ? authUser.userId : 'Guest';
  const userName = authUser ? authUser.userName : 'Khách';
  const userAvatar = authUser?.avatar || defaultAvatar;
  const botAvatar = defaultBotImage;

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(addUserMessage({ sender: userId, text: input }));
      dispatch(sendMessage({ text: input }));
      setInput('');
    }
  };

  // useEffect(() => {
  //   if (error) {
  //     const timer = setTimeout(() => dispatch(clearError()), 3000);
  //     if (error.includes('Token expired')) {
  //       navigate('/auth/sign-in', { replace: true });
  //     }
  //     return () => clearTimeout(timer);
  //   }
  // }, [error, dispatch, navigate]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 focus:outline-none transition-all duration-300"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300">
          <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src={botAvatar}
                alt="RadarBot"
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <div>
                <h1 className="text-lg font-semibold">RadarBot</h1>
                <p className="text-xs">Đang trò chuyện với: {userName}</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    msg.sender !== 'bot' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <img
                      src={botAvatar}
                      alt="RadarBot"
                      className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                      onError={(e) => (e.target.src = defaultAvatar)}
                    />
                  )}
                  <div
                    className={`max-w-xs p-2 rounded-lg ${
                      msg.sender !== 'bot'
                        ? 'bg-purple-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 shadow rounded-tl-none'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {msg.sender === 'bot' ? 'RadarBot' : userName}
                    </div>
                    {msg.text && (
                      <div className="text-sm mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                    )}
                    {msg.jobs && (
                      <div className="space-y-2">
                        {msg.jobs.map((job, jobIndex) => (
                          <div
                            key={jobIndex}
                            className="border rounded-lg p-2 bg-gray-50 shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={job.logo}
                                alt={job.companyName}
                                className="w-8 h-8 object-contain rounded"
                                onError={(e) => (e.target.src = defaultAvatar)}
                              />
                              <div>
                                <h3 className="text-xs font-semibold">{job.title}</h3>
                                <p className="text-xs text-gray-600">{job.companyName}</p>
                              </div>
                            </div>
                            <div className="mt-1 text-xs">
                              <p>
                                <span className="font-medium">Địa điểm:</span> {job.cityName}
                              </p>
                              <p>
                                <span className="font-medium">Lương:</span>{' '}
                                {(job.salary / 1000000).toFixed(1)} triệu VND
                              </p>
                              <p>
                                <span className="font-medium">Ngành:</span> {job.industryNames}
                              </p>
                            </div>
                            <a
                              href={job.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded hover:bg-purple-700"
                            >
                              Xem chi tiết
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.sender !== 'bot' && (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover ml-2 self-end"
                      onError={(e) => (e.target.src = defaultAvatar)}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                Bắt đầu cuộc trò chuyện với RadarBot...
              </div>
            )}
            {loading && (
              <div className="flex justify-start mb-3">
                <img
                  src={botAvatar}
                  alt="RadarBot"
                  className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                  onError={(e) => (e.target.src = defaultAvatar)}
                />
                <div className="max-w-xs p-2 rounded-lg bg-gray-200 text-gray-600 rounded-tl-none">
                  <div className="text-xs opacity-75 mb-1">RadarBot</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* {error && (
              <div className="text-center text-red-500 flex items-center justify-center gap-2 text-xs p-2">
                {error}
                {error.includes('Token expired') && (
                  <button
                    onClick={() => navigate('/auth/sign-in')}
                    className="text-purple-500 underline"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            )} */}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 bg-white border-t">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;