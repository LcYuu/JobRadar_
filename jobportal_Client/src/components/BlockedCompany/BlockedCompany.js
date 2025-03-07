import React, { useState } from "react";

const BlockCompany= ({ onSubmit }) => {
  const blockDurations = [
    { label: "3 ngày", value: 3 },
    { label: "7 ngày", value: 7 },
    { label: "15 ngày", value: 15 },
    { label: "30 ngày", value: 30 },
    { label: "1 năm", value: 365 },
    { label: "Vĩnh viễn", value: "permanent" },
  ];

  const blockReasons = [
    { label: "Vi phạm điều khoản sử dụng", value: "Vi phạm điều khoản sử dụng" },
    { label: "Cung cấp thông tin sai lệch", value: "Cung cấp thông tin sai lệch" },
    { label: "Lừa đảo, gian lận", value: "Lừa đảo, gian lận" },
    { label: "Báo cáo từ người dùng", value: "Báo cáo từ người dùng" },
    { label: "Khác", value: "Khác" },
  ];

  const [selectedDuration, setSelectedDuration] = useState(blockDurations[0].value);
  const [selectedReason, setSelectedReason] = useState(blockReasons[0].value);
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    let blockedUntil = null;

    if (selectedDuration !== "permanent") {
      blockedUntil = new Date();
      blockedUntil.setDate(blockedUntil.getDate() + Number(selectedDuration));
    }

    const reason = selectedReason === "Khác" ? customReason : selectedReason;

    onSubmit({
      blockedUntil: blockedUntil ? blockedUntil.toISOString() : null,
      blockedReason: reason,
    });
  };

  return (
    <div className="block-company-form">
      <h3>Khóa tài khoản công ty</h3>
      <form onSubmit={handleSubmit}>
        {/* Chọn thời gian khóa */}
        <div className="form-group">
          <label>Thời gian khóa:</label>
          <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}>
            {blockDurations.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn lý do khóa */}
        <div className="form-group">
          <label>Lý do khóa:</label>
          <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
            {blockReasons.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nhập lý do nếu chọn "Khác" */}
        {selectedReason === "Khác" && (
          <div className="form-group">
            <label>Nhập lý do:</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
              required
            />
          </div>
        )}

        <button type="submit">Xác nhận khóa</button>
      </form>
    </div>
  );
};

export default BlockCompany;
