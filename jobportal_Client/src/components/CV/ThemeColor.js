import React, { useContext, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { LayoutGrid } from "lucide-react";
import { CVInfoContext } from "../../context/CVInfoContext";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateCV } from "../../redux/GeneratedCV/generated_cv.thunk";

const ThemeColor = () => {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A1",
    "#A133FF",
    "#33FFA1",
    "#FF7133",
    "#71FF33",
    "#7133FF",
    "#FF3371",
    "#33FF71",
    "#3371FF",
    "#A1FF33",
    "#33A1FF",
    "#FF5733",
    "#5733FF",
    "#33FF5A",
    "#5A33FF",
    "#FF335A",
    "#335AFF",
  ];

  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const [selectedColor, setSelectedColor] = useState();
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  const onColorSelect = async (color) => {
      setSelectedColor(color)

      setCvInfo((prev) => ({
        ...prev,
        themeColor: color,
      }));
  
      // Chuyển đổi cvInfo thành JSON dạng string
      const cvData = JSON.stringify(cvInfo).replace(/"/g, '\\"'); // Escape dấu "
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ \"cvContent\": \"${cvData}\" }`, 
        })
      );
    };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-2">
          {" "}
          <LayoutGrid /> Theme
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h2 className="mb-2 text-sm font-bold">Select Theme Color</h2>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((item, index) => (
            <div
              onClick={() => onColorSelect(item)}
              className={`h-5 w-5 rounded-full cursor-pointer
               hover:border-black border
               ${selectedColor === item && "border border-black"}
               `}
              style={{
                background: item,
              }}
            ></div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeColor;
