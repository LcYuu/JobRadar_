import React, { useState, useEffect } from "react";
import ReactSlider from "react-slider";
import "./RangeSlider.css";

const RangeSlider = ({ min = 0, max = 100, onChange }) => {
  const [values, setValues] = useState([min, max]);

  useEffect(() => {
    // Cập nhật values khi min hoặc max thay đổi
    setValues([min, max]);
  }, [min, max]);

  const handleChange = (newValues) => {
    setValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  // Hàm định dạng số với dấu chấm
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <div className="range">
      <ReactSlider
        className="slider"
        thumbClassName="thumb"
        trackClassName="track"
        min={min}
        max={max}
        value={values}
        onChange={handleChange}
        pearling
      />
      <div className="container">
        <div className="from">Từ: {formatCurrency(values[0])}</div>
        <div className="to">Đến: {formatCurrency(values[1])}</div>
      </div>
    </div>
  );
};

export default RangeSlider;
