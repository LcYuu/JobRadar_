import React, { useContext, useState } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Editor,
  EditorProvider,
  Toolbar,
} from "react-simple-wysiwyg";
import { CVInfoContext } from "../../context/CVInfoContext";

const RichTextEditor = ({ onRichTextEditorChange, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || "");
  const { cvInfo } = useContext(CVInfoContext);

  return (
    <div className="mt-5">
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(e);
          }}
          containerProps={{ style: { minHeight: "100px", resize: "vertical" } }}
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
    </div>
  );
};

export default RichTextEditor;