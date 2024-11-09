import React, { useEffect } from "react";
import {
  FaCloudUploadAlt,
  FaShareAlt,
  FaDownload,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getCVBySeeker, updateCVIsMain } from "../../redux/CV/cv.action";

const MyCV = () => {
  const dispatch = useDispatch();
  const {
    cvs = [],
    successMessage,
    loading,
    error,
  } = useSelector((store) => store.cv);

  const handleSetAsMainCV = async (cvId) => {
    await dispatch(updateCVIsMain(cvId));
    dispatch(getCVBySeeker());
  };

  useEffect(() => {
    dispatch(getCVBySeeker());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">CV đã tải lên TopCV</h2>
      <button className="bg-green-500 text-white px-4 py-2 rounded mb-4 flex items-center ml-auto">
        <FaCloudUploadAlt className="mr-2" />
        Tải CV lên
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cvs.map((cv) => (
          <div
            key={cv.cvId}
            className="border rounded-lg p-4 relative shadow-lg"
          >
            <img
              src={cv.pathCV}
              alt="CV Preview"
              className="rounded-lg w-full h-48 object-cover"
            />

            {/* Nếu là CV chính, hiển thị nhãn "CV chính" */}
            {cv.isMain && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                CV chính
              </span>
            )}

            <div className="mt-4">
              <h3 className="text-lg font-semibold">{cv.title}</h3>
              <p className="text-sm text-gray-500">
                Cập nhật lần cuối 
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 text-gray-600">
              {/* Chia sẻ */}
              <button
                onClick={() => handleSetAsMainCV(cv.cvId)}
                className="flex items-center space-x-1"
              >
                <FaEdit />
                <span>Đặt làm CV chính</span>
              </button>

              <button
                className="flex items-center space-x-1"
                // onClick={() => handleDelete(cv.id)}
              >
                <FaTrashAlt />{" "}
                {/* Thay FaShareAlt thành FaTrashAlt cho biểu tượng xóa */}
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCV;
