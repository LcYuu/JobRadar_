import React, { useRef } from "react";

const EditableField = ({ value, onChange, placeholder, className }) => {
  const ref = useRef(null);

  const handleBlur = () => {
    onChange(ref.current.innerText);
  };

  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{ outline: "none", minHeight: "20px" }}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableField;
