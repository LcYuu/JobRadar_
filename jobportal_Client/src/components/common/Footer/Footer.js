import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import logo from "../../../assets/images/common/logo.jpg";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubscription,
  deleteSubscription,
  findSubscriptionBySeekerId,
  updateSubscription,
} from "../../../redux/Subscription/subscriptionthunk";
import Swal from "sweetalert2";

export default function Footer() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { currentSubscription, loading, message, error } = useSelector(
    (store) => store.subscription
  );
  const socialIcons = [
    { icon: faTwitter, link: "https://twitter.com" },
    { icon: faInstagram, link: "https://instagram.com" },
    { icon: faLinkedinIn, link: "https://linkedin.com" },
  ];

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    dispatch(findSubscriptionBySeekerId());
  }, [dispatch]);
  
  useEffect(() => {
    if (currentSubscription?.email) {
      setEmail(currentSubscription.email);
    }
  }, [currentSubscription]);

const handleSubscribe = async () => {
  if (!email) {
    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: "Vui lòng nhập email của bạn.",
    });
    return;
  }

  if (!validateEmail(email)) {
    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: "Email không hợp lệ.",
    });
    return;
  }

  try {
    let response;
    if (currentSubscription) {
      const subId = currentSubscription.subscriptionId;
      response = await dispatch(updateSubscription({ subId, email }));
    } else {
      response = await dispatch(createSubscription({ email }));
    }

    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: response.message || "Cập nhật thành công!",
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: err.message || "Đã xảy ra lỗi. Vui lòng thử lại!",
    });
  }
};

const handleUnsubscribe = async () => {
  if (!currentSubscription || !currentSubscription.subscriptionId) {
    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: "Không tìm thấy thông tin đăng ký!",
    });
    return;
  }

  const result = await Swal.fire({
    title: "Xác nhận hủy đăng ký?",
    text: "Bạn có chắc chắn muốn hủy nhận thông báo không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      const subId = currentSubscription.subscriptionId;
      const response = await dispatch(deleteSubscription(subId)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Đã hủy đăng ký!",
        text: response.message || "Hủy đăng ký thành công!",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: err.message || "Đã xảy ra lỗi. Vui lòng thử lại!",
      });
    }
  }
};


  return (
    <footer className="footer bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logo}
                alt="logo"
                className="w-8 h-8 bg-purple-600 rounded-full"
              />
              <span className="text-xl font-bold text-white">JobRadar</span>
            </div>
            <p className="text-slate-200 text-sm">
              Nền tảng tuyệt vời dành cho người tìm việc.
              <br />
              Tìm công việc mơ ước của bạn dễ dàng hơn.
            </p>
          </div>

          <div className="mb-8 md:mb-0 flex flex-col items-center justify-center">
            <h4 className="font-semibold text-white mb-2">
              Đăng ký nhận thông báo việc làm
            </h4>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-64 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {currentSubscription ? (
                <Button
                  className="bg-blue-600 text-white"
                  onClick={handleSubscribe}
                >
                  Cập nhật email
                </Button>
              ) : (
                <Button
                  className="bg-purple-600 text-white"
                  onClick={handleSubscribe}
                >
                  Đăng ký
                </Button>
              )}
            </div>

            {currentSubscription && (
              <Button
                className="bg-red-600 text-white mt-2"
                onClick={handleUnsubscribe}
              >
                Hủy đăng ký
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Companies</li>
                <li>Pricing</li>
                <Link
                  to="/terms-of-service"
                  className="text-indigo-600 hover:underline"
                >
                  <li>Terms</li>
                </Link>
                <li>Advice</li>
                <Link
                  to="/privacy-policy"
                  className="text-indigo-600 hover:underline"
                >
                  <li>Privacy Policy</li>
                </Link>
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
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 JobRadar. All rights reserved.
          </p>
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
