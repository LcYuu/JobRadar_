import { MoreVertical, Notebook } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import cvImage from "../../assets/images/common/cv.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { deleteCV, getGenCVBySeeker } from "../../redux/GeneratedCV/generated_cv.thunk";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CVCardItem = ({ cv }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleDelete = async (genCvId) => {
    console.log("🚀 ~ handleDelete ~ genCvId:", genCvId)
    const result = await Swal.fire({
      title: "Xác nhận xóa CV này",
      text: "Bạn có chắc chắn muốn xóa CV này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCV(genCvId));
        dispatch(getGenCVBySeeker())
        toast.success("Xóa CV thành công!");
      } catch (error) {
        toast.error("Xóa CV thất bại. Vui lòng thử lại!");
      }
    }
  };
  return (
    <div className="">
      <Link to={"/create-cv/detail-cv/" + cv.generatedCvId}>
        <div
          className="p-14 bg-gradient-to-b from-pink-100 via-purple-200 to-blue-200 h-[280px] rounded-t-lg border-t-4"
          style={{
            borderColor: cv?.themeColor,
          }}
        >
          <div className="flex items-center justify-center h-[180px]">
            <img src={cvImage} width={80} height={80} alt="CV Image" />
          </div>
        </div>
      </Link>
      <div
        className="border p-3 flex justify-between  text-white rounded-b-lg shadow-lg"
        style={{
          background: cv?.themeColor,
        }}
      >
        <h2 className="text-sm text-center my-1 pt-2">{cv.cvName}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 cursor-pointer text-gray-600 hover:text-gray-800" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-md rounded-md">
            <DropdownMenuItem
              onClick={() =>
                navigate("/create-cv/detail-cv/" + cv.generatedCvId)
              }
              className=""
            >
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className=""onClick={() =>
                navigate("/create-cv/view/" + cv.generatedCvId)
              } >Xem</DropdownMenuItem>
            <DropdownMenuItem className=""onClick={() =>
                navigate("/create-cv/view/" + cv.generatedCvId)
              }>Tải về</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(cv.generatedCvId)}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CVCardItem;
