import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Điều khoản dịch vụ</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Giới thiệu</h2>
          <p className="text-gray-700">
            Chào mừng bạn đến với nền tảng tuyển dụng của chúng tôi. Bằng việc truy cập và sử dụng dịch vụ, 
            bạn đồng ý tuân theo các điều khoản và điều kiện được quy định dưới đây.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Điều kiện sử dụng</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Bạn phải từ đủ 18 tuổi trở lên để sử dụng dịch vụ</li>
            <li>Cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
            <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
            <li>Bảo mật thông tin tài khoản của bạn</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Quyền và trách nhiệm</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Quyền của người dùng:</strong>
              <ul className="list-disc pl-6 mt-2">
                <li>Truy cập và sử dụng các tính năng của nền tảng</li>
                <li>Đăng tin tuyển dụng (đối với nhà tuyển dụng)</li>
                <li>Ứng tuyển công việc (đối với người tìm việc)</li>
              </ul>
            </p>
            <p>
              <strong>Trách nhiệm của người dùng:</strong>
              <ul className="list-disc pl-6 mt-2">
                <li>Tuân thủ pháp luật hiện hành</li>
                <li>Không xâm phạm quyền của người khác</li>
                <li>Bảo mật thông tin cá nhân</li>
              </ul>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Thay đổi điều khoản</h2>
          <p className="text-gray-700">
            Chúng tôi có quyền thay đổi điều khoản dịch vụ vào bất kỳ thời điểm nào. 
            Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;