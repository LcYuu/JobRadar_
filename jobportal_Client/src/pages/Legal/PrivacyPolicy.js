import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Chính sách bảo mật</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Thu thập thông tin</h2>
          <p className="text-gray-700">
            Chúng tôi thu thập các thông tin sau đây:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Thông tin cá nhân (tên, email, số điện thoại)</li>
            <li>Thông tin nghề nghiệp</li>
            <li>Hồ sơ và CV</li>
            <li>Dữ liệu sử dụng website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Sử dụng thông tin</h2>
          <p className="text-gray-700">
            Thông tin của bạn được sử dụng để:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Cung cấp và cải thiện dịch vụ</li>
            <li>Kết nối ứng viên với nhà tuyển dụng</li>
            <li>Gửi thông báo và cập nhật</li>
            <li>Phân tích và nghiên cứu thị trường</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Bảo mật thông tin</h2>
          <p className="text-gray-700">
            Chúng tôi cam kết:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Bảo vệ thông tin cá nhân của bạn</li>
            <li>Không chia sẻ thông tin với bên thứ ba khi chưa được sự đồng ý</li>
            <li>Áp dụng các biện pháp bảo mật phù hợp</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Quyền của người dùng</h2>
          <p className="text-gray-700">
            Bạn có quyền:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Truy cập và chỉnh sửa thông tin cá nhân</li>
            <li>Yêu cầu xóa tài khoản</li>
            <li>Từ chối nhận email marketing</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;