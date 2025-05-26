import React, { useContext, useState } from "react";
import {
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnNumberedList,
  BtnBulletList,
  BtnLink,
  BtnClearFormatting,
  Editor,
  EditorProvider,
  Toolbar,
} from "react-simple-wysiwyg";
import { CVInfoContext } from "../../context/CVInfoContext";

const RichTextEditor = ({
  onRichTextEditorChange,
  defaultValue,
  placeholder,
  className,
  onBlur,
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const { cvInfo } = useContext(CVInfoContext);

  return (
    <div className={`mt-5 ${className}`}>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(e);
          }}
          onBlur={onBlur}
          containerProps={{
            style: { minHeight: "100px", resize: "vertical" },
            className: "rs-wysiwyg-editor",
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <BtnNumberedList />
            <BtnBulletList />
            <BtnLink />
            <BtnClearFormatting />
          </Toolbar>
        </Editor>
      </EditorProvider>
      <style jsx>{`
        .rs-wysiwyg-editor:empty:before {
          content: "${placeholder || "Nhập nội dung..."}";
          color: #a0aec0; /* Màu xám nhạt giống placeholder */
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;