import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'; 
import logo from '../../../assets/images/common/logo.jpg';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const socialIcons = [
    { icon: faFacebookF, link: 'https://facebook.com' },
    { icon: faTwitter, link: 'https://twitter.com' },
    { icon: faInstagram, link: 'https://instagram.com' },
    { icon: faLinkedinIn, link: 'https://linkedin.com' }
  ];

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubscribe = () => {
    if (!email) {
      setMessage('Vui lòng nhập email của bạn.');
    } else if (!validateEmail(email)) {
      setMessage('Email không hợp lệ.');
    } else {
      setMessage('Đăng ký nhận thông báo thành công!');
      // Additional subscription logic goes here
    }

    // Clear message after 5 seconds and reset the form
    setTimeout(() => {
      setMessage('');
      setEmail('');
    }, 5000);
  };

  return (
    <footer className="footer bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="logo" className="w-8 h-8 bg-purple-600 rounded-full" />
              <span className="text-xl font-bold text-white">JobRadar</span>
            </div>
            <p className="text-slate-200 text-sm">
              Nền tảng tuyệt vời dành cho người tìm việc.
              <br />
              Tìm công việc mơ ước của bạn dễ dàng hơn.
            </p>
          </div>

          <div className="mb-8 md:mb-0 flex flex-col items-center justify-center">
            <h4 className="font-semibold text-white mb-2">Đăng ký nhận thông báo việc làm</h4>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-64 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-purple-600 text-white" onClick={handleSubscribe}>
                Đăng ký
              </Button>
            </div>
            {message && <p className="text-sm mt-2 text-gray-200">{message}</p>}
          </div>

          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Companies</li>
                <li>Pricing</li>
                <li>Terms</li>
                <li>Advice</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Help Docs</li>
                <li>Guide</li>
                <li>Updates</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 JobRadar. All rights reserved.</p>
          <div className="flex space-x-4">
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
