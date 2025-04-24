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
import {
  deleteCV,
  getGenCVBySeeker,
} from "../../redux/GeneratedCV/generated_cv.thunk";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CVCardItem = ({ cv }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async (genCvId) => {
    console.log("🚀 ~ handleDelete ~ genCvId:", genCvId);
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
        dispatch(getGenCVBySeeker());
        toast.success("Xóa CV thành công!");
      } catch (error) {
        toast.error("Xóa CV thất bại. Vui lòng thử lại!");
      }
    }
  };
  return (
    <div className="group transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-lg">
      <Link to={"/create-cv/detail-cv/" + cv.generatedCvId}>
        <div
          className="p-14 bg-gradient-to-b from-pink-100 via-purple-200 to-blue-200 h-[280px] rounded-t-lg border-t-4 transition-all duration-300 group-hover:brightness-105"
          style={{
            borderColor: cv?.themeColor,
          }}
        >
          <div className="flex items-center justify-center h-[180px] transition-transform duration-300 group-hover:scale-110">
            <img
              src={cvImage}
              width={80}
              height={80}
              alt="CV Image"
              className="transition-all duration-300 group-hover:drop-shadow-lg"
            />
          </div>
        </div>
      </Link>
      <div
        className="border p-3 flex justify-between text-white rounded-b-lg shadow-lg transition-all duration-300 group-hover:shadow-xl"
        style={{
          background: cv?.themeColor,
        }}
      >
        <h2 className="text-sm text-center my-1 pt-2 transition-all duration-300 group-hover:font-bold">
          {cv.cvName}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-all">
            <MoreVertical className="h-4 w-4 cursor-pointer text-black drop-shadow-md" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-md rounded-md">
            <DropdownMenuItem
              onClick={() =>
                navigate("/create-cv/detail-cv/" + cv.generatedCvId)
              }
              className="hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate("/create-cv/view/" + cv.generatedCvId)}
            >
              Xem
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate("/create-cv/view/" + cv.generatedCvId)}
            >
              Tải về
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(cv.generatedCvId)}
              className="hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CVCardItem;
