import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  const [emailFrequency, setEmailFrequency] = useState("THREE_DAYS");
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

  // Lấy thông tin đăng ký khi component mount
  useEffect(() => {
    dispatch(findSubscriptionBySeekerId());
  }, [dispatch]);
  useEffect(() => {
    if (currentSubscription?.email) {
      setEmail(currentSubscription.email);
      setEmailFrequency(currentSubscription.emailFrequency || "THREE_DAYS");
    } else {
      setEmail("");
      setEmailFrequency("THREE_DAYS");
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

    const validFrequencies = [
      "THREE_DAYS",
      "SEVEN_DAYS",
      "TWO_WEEKS",
      "ONE_MONTH",
      "TWO_MONTHS",
    ];
    if (!validFrequencies.includes(emailFrequency)) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Tần suất gửi email không hợp lệ.",
      });
      return;
    }

    try {
      let response;
      if (currentSubscription) {
        const subId = currentSubscription.subscriptionId;
        response = await dispatch(
          updateSubscription({ subId, email, emailFrequency })
        ).unwrap();
      } else {
        response = await dispatch(
          createSubscription({ email, emailFrequency })
        ).unwrap();
        setEmail("");
        setEmailFrequency("THREE_DAYS");
      }


      await dispatch(findSubscriptionBySeekerId());

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: response || "Cập nhật thành công!",

      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: err || "Đã xảy ra lỗi. Vui lòng thử lại!",
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
        await dispatch(findSubscriptionBySeekerId());
        setEmail("");
        setEmailFrequency("THREE_DAYS");


        Swal.fire({
          icon: "success",
          title: "Đã hủy đăng ký!",
          text: response || "Hủy đăng ký thành công!",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: err || "Đã xảy ra lỗi. Vui lòng thử lại!",
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
            <h4 className="font-semibold text-white mb-4 text-center">
              Đăng ký nhận thông báo việc làm
            </h4>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full max-w-md">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 text-gray-900 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}

                disabled={loading}
              />
              <select
                className="flex-1 p-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                value={emailFrequency}
                onChange={(e) => setEmailFrequency(e.target.value)}
                disabled={loading}
                title="Chọn tần suất nhận thông báo công việc"
              >
                <option value="THREE_DAYS">3 ngày</option>
                <option value="SEVEN_DAYS">7 ngày</option>
                <option value="TWO_WEEKS">2 tuần</option>
                <option value="ONE_MONTH">1 tháng</option>
                <option value="TWO_MONTHS">2 tháng</option>
              </select>
              <Button
                className={`${
                  currentSubscription ? "bg-purple-600" : "bg-purple-500"
                } text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : currentSubscription ? "Cập nhật" : "Đăng ký"}
              </Button>

            </div>
            {currentSubscription && (
              <Button
                className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mt-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleUnsubscribe}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Hủy đăng ký"}
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
                  className="text-purple-600 hover:underline"
                >
                  <li>Terms</li>
                </Link>
                <li>Advice</li>
                <Link
                  to="/privacy-policy"
                  className="text-purple-600 hover:underline"
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
            © 2025 JobRadar. All rights reserved.
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