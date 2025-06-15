import React, { useEffect, useState } from "react";
import { Button } from "../../../ui/button";
import { X, LinkIcon } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "../../../ui/alert-dialog";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { ContentState, EditorState } from "draft-js";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";

import { FaCheckCircle } from "react-icons/fa";
import { getCVBySeeker } from "../../../redux/CV/cv.thunk";
import {
  checkIfApplied,
  createApply,
  updateApply,
  getApplyJobByUser,
} from "../../../redux/ApplyJob/applyJob.thunk";

// Thêm CSS cho spinner animation
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spinner {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}
`;

const ApplyModal = ({ job, open, handleClose, oneApplyJob }) => {
  const dispatch = useDispatch();
  const [editorState, setEditorState] = useState();
  const { cvs = [] } = useSelector((store) => store.cv);
  const [uploadOption, setUploadOption] = useState("existing");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getCVBySeeker());
  }, [dispatch]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    description: "",
    pathCV: "",
  });

  useEffect(() => {
    // Tự động chọn CV có `isMain` nếu chưa có giá trị trong formData.pathCV
    if (!formData.pathCV) {
      const mainCV = cvs.find((cv) => cv.isMain); // Tìm CV chính
      if (mainCV) {
        setFormData((prev) => ({
          ...prev,
          pathCV: mainCV.pathCV, // Thiết lập URL của CV chính
        }));
        setUploadOption("existing"); // Thiết lập tùy chọn là "CV có sẵn"
      }
    }
  }, [cvs, formData.pathCV]); // Chạy khi danh sách CV hoặc formData.pathCV thay đổi

  // const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { postId } = useParams();

  // Dispatch createApply khi modal được mở
  useEffect(() => {
    if (oneApplyJob) {
      setFormData({
        fullName: oneApplyJob.fullName || "",
        email: oneApplyJob.email || "",
        pathCV: oneApplyJob.pathCV || "",
        description: oneApplyJob.description || "",
      });
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromText(oneApplyJob.description || "")
        )
      );
      // Set upload option to existing if a CV is already selected
      if (oneApplyJob.pathCV) {
        setUploadOption("existing");
      }
    } else {
      // Reset form khi không có applicationData (nộp mới)
      setFormData({
        fullName: "",
        email: "",
        pathCV: "",
        description: "",
      });
      setEditorState(EditorState.createEmpty());
    }
  }, [oneApplyJob]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Kiểm tra xem người dùng đã chọn file CV chưa
    if (!selectedFile && !formData.pathCV) {
      toast.error("Vui lòng chọn file CV hoặc chọn CV có sẵn");
      setLoading(false); // Stop loading
      return; // Dừng quá trình submit nếu không có file
    }

    try {
      // Nếu có thông tin ứng tuyển trước đó (update)
      if (oneApplyJob) {
        if (selectedFile) {
          // Nếu có chọn file mới, cần upload lên Cloudinary
          try {
            toast.info("Đang tải CV lên, vui lòng đợi...");

            // Sanitize file name
            const originalName = selectedFile.name;
            const sanitizedName = originalName.replace(/[^\w.-]/g, "_");

            // Create a new File object with the sanitized name if needed
            let fileToUpload = selectedFile;
            if (sanitizedName !== originalName) {
              fileToUpload = new File([selectedFile], sanitizedName, {
                type: selectedFile.type,
              });
            }

            const uploadedFile = await uploadToCloudinary(fileToUpload);

            const updatedFormData = {
              ...formData,
              pathCV: uploadedFile, // Gán URL file đã upload vào formData
            };

            await dispatch(updateApply({ applyData: updatedFormData, postId }));
            // Refresh lại danh sách đơn apply để hiển thị thông tin mới nhất
            await dispatch(getApplyJobByUser({ currentPage: 0, size: 10 }));
            toast.success("Cập nhật ứng tuyển thành công!");
            handleClose();
          } catch (error) {
            console.error("Upload error:", error);
            toast.error(
              "Đã có lỗi khi tải lên CV: " +
                (error.message || "Lỗi không xác định")
            );
            setLoading(false); // Stop loading
            return;
          }
        } else {
          // Nếu không chọn file mới, chỉ gửi formData có sẵn
          try {
            await dispatch(updateApply({ applyData: formData, postId }));
            // Refresh lại danh sách đơn apply để hiển thị thông tin mới nhất
            await dispatch(getApplyJobByUser({ currentPage: 0, size: 10 }));
            toast.success("Cập nhật ứng tuyển thành công!");
            handleClose();
          } catch (error) {
            console.error("Update error:", error);
            toast.error(
              "Lỗi khi cập nhật: " + (error.message || "Lỗi không xác định")
            );
            setLoading(false); // Stop loading
            return;
          }
        }
      } else {
        // Nếu là create mới (không có ứng tuyển trước đó)
        if (selectedFile) {
          // Nếu có chọn file mới, cần upload lên Cloudinary
          try {
            toast.info("Đang tải CV lên, vui lòng đợi...");

            // Sanitize file name
            const originalName = selectedFile.name;
            const sanitizedName = originalName.replace(/[^\w.-]/g, "_");

            // Create a new File object with the sanitized name if needed
            let fileToUpload = selectedFile;
            if (sanitizedName !== originalName) {
              fileToUpload = new File([selectedFile], sanitizedName, {
                type: selectedFile.type,
              });
            }

            const uploadedFile = await uploadToCloudinary(fileToUpload);

            const updatedFormData = {
              ...formData,
              pathCV: uploadedFile, // Gán URL file đã upload vào formData
            };

            await dispatch(createApply({ applyData: updatedFormData, postId }));
            dispatch(checkIfApplied(postId));
            toast.success("Ứng tuyển thành công!");
            handleClose();
          } catch (error) {
            console.error("Upload error:", error);
            toast.error(
              "Đã có lỗi khi tải lên CV: " +
                (error.message || "Lỗi không xác định")
            );
            setLoading(false); // Stop loading
            return;
          }
        } else {
          // Nếu không chọn file mới, chỉ gửi formData có sẵn
          try {
            await dispatch(createApply({ applyData: formData, postId }));
            dispatch(checkIfApplied(postId));
            toast.success("Ứng tuyển thành công!");
            handleClose();
          } catch (error) {
            console.error("Apply error:", error);
            toast.error(
              "Lỗi khi ứng tuyển: " + (error.message || "Lỗi không xác định")
            );
            setLoading(false); // Stop loading
            return;
          }
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Hàm xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Hàm đóng modal với xác nhận
  const handleCloseButtonClick = (e) => {
    console.log("Modal close button clicked"); // Để kiểm tra xem có sự kiện được gọi không
    handleClose();
  };

  const handleCVSelection = (cv) => {
    // Cập nhật formData với đường dẫn CV đã chọn
    setFormData((prevState) => ({
      ...prevState,
      pathCV: cv.pathCV, // Cập nhật đường dẫn CV vào formData
    }));
    setUploadOption("existing"); // Chuyển sang chế độ chọn CV có sẵn
    setSelectedFile(null); // Đặt lại file đã chọn nếu có

    // Đặt lại giá trị của input file
    if (document.getElementById("cv-upload")) {
      document.getElementById("cv-upload").value = "";
    }
  };
  const handleRemove = () => {
    setSelectedFile(null);
    setUploadOption(null);
    document.getElementById("cv-upload").value = "";
  };
  return (
    <>
      {/* Thêm style cho spinner animation */}
      <style>{spinnerStyles}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 p-6 border-b">
            <button
              onClick={handleCloseButtonClick}
              className="absolute top-4 right-4 text-gray-500"
              disabled={loading} // Disable nút đóng khi đang loading
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <img
                  src={job?.company?.logo}
                  alt="Company logo"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{job?.title}</h2>
                <p className="text-sm text-gray-600">
                  {job?.company?.companyName} • {job?.city?.cityName} •{" "}
                  {job?.typeOfWork}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">
              Gửi đơn đăng ký của bạn
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Những thông tin dưới đây là bắt buộc và sẽ chỉ được chia sẻ với
              công ty {job?.company?.companyName}
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên đầy đủ
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading} // Disable input khi đang loading
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading} // Disable input khi đang loading
                />
              </div>

              <div>
                <label className="cursor-text hover:cursor-default block text-sm font-medium text-gray-700 mb-1">
                  Thông tin thêm
                </label>
                <div className="border rounded-lg">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={(newState) => {
                      const plainText = newState
                        .getCurrentContent()
                        .getPlainText();
                      if (plainText.length <= 1000) {
                        setEditorState(newState);
                        setFormData({
                          ...formData,
                          description: plainText,
                        });
                      }
                    }}
                    toolbar={{
                      options: ["inline", "list"],
                      inline: { options: ["bold", "italic", "underline"] },
                    }}
                    editorClassName="px-3 py-2 min-h-[200px] cursor-text"
                    readOnly={loading} // Đặt readOnly khi đang loading
                  />
                  <div className="border-t p-2 flex justify-end">
                    <span className="text-sm text-gray-500">
                      {formData.description.length} / 1000
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đính kèm CV của bạn tại đây
                </label>

                <div className="border p-6 rounded-lg shadow-sm bg-white">
                  {/* Chọn CV từ thư viện nếu có */}
                  {cvs.length > 0 && (
                    <div className="mb-6">
                      <label className="text-gray-700 font-semibold">
                        Chọn CV từ thư viện của bạn:
                      </label>
                      <ul className="mt-3 space-y-2">
                        {cvs.map((cv) => (
                          <li
                            key={cv.cvId}
                            className={`flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => !loading && handleCVSelection(cv)} // Disable click khi đang loading
                          >
                            <input
                              type="radio"
                              name="cvOption"
                              onChange={() => handleCVSelection(cv)}
                              checked={
                                uploadOption === "existing" &&
                                formData.pathCV === cv.pathCV
                              }
                              className="form-radio text-purple-600"
                              disabled={loading} // Disable input khi đang loading
                            />
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-800">{cv.cvName}</span>
                              {cv.isMain && (
                                <span className="text-sm text-white bg-green-500 px-2 py-1 rounded-md flex items-center space-x-1">
                                  <FaCheckCircle className="text-white text-xs" />
                                </span>
                              )}
                            </div>
                            <a
                              href={cv.pathCV}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-blue-600 hover:underline ${loading ? "pointer-events-none" : ""}`}
                              onClick={(e) => loading && e.preventDefault()} // Ngăn click khi đang loading
                            >
                              Xem
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tải lên CV mới */}
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cvOption"
                        onChange={() => {
                          setUploadOption("new");
                          setSelectedFile(null);
                        }}
                        checked={uploadOption === "new"}
                        className="form-radio text-purple-600"
                        disabled={loading} // Disable input khi đang loading
                      />
                      <span className="font-semibold text-gray-800">
                        Tải lên CV từ máy tính
                      </span>
                    </label>
                    {uploadOption === "new" && (
                      <div className="border-2 border-dashed rounded-lg p-6 mt-4 text-center bg-gray-50">
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          id="cv-upload"
                          onChange={handleFileChange}
                          disabled={loading} // Disable input khi đang loading
                        />
                        {!selectedFile ? (
                          <label
                            htmlFor="cv-upload"
                            className={`cursor-pointer flex flex-col items-center justify-center space-y-2 text-purple-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <LinkIcon className="h-6 w-6" />
                            <span className="font-medium">
                              Nhấp vào đây để đính kèm CV
                            </span>
                          </label>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-4">
                              <LinkIcon className="h-6 w-6 text-gray-700" />
                              <span className="text-gray-700 font-medium">
                                {selectedFile.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Kích thước: {selectedFile.size || "N/A"} MB
                            </div>
                            <button
                              type="button"
                              onClick={handleRemove}
                              className={`text-sm text-red-600 hover:underline ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                              disabled={loading} // Disable button khi đang loading
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full py-3 rounded-lg ${loading ? "bg-purple-400" : "bg-purple-600"} text-white flex items-center justify-center`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi"
                )}
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Bằng cách gửi yêu cầu, bạn có thể xác nhận rằng bạn chấp nhận{" "}
                <a 
                  href="#" 
                  className={`text-purple-600 hover:underline ${loading ? "pointer-events-none" : ""}`}
                  onClick={(e) => loading && e.preventDefault()} // Ngăn click khi đang loading
                >
                  Terms of Service
                </a>{" "}
                và{" "}
                <a 
                  href="#" 
                  className={`text-purple-600 hover:underline ${loading ? "pointer-events-none" : ""}`}
                  onClick={(e) => loading && e.preventDefault()} // Ngăn click khi đang loading
                >
                  Privacy Policy
                </a>{" "}
                của chúng tôi
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyModal;