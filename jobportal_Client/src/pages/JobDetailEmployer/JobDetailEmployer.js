import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Building,
  Calendar,
  Eye,
  User,
  Hourglass,
  Edit,
} from "lucide-react";
import {
  getDetailJobById,
  updateJob,
} from "../../redux/JobPost/jobPost.action";
import { store } from "../../redux/store";
import SkillJobPostModal from "./SkillJobPostModal";
import { Badge } from "@mui/material";

const JobDetailEmployer = () => {
  const colors = [
    "bg-sky-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-green-500",
    "bg-orange-500",
  ];

  // Hàm lấy màu sắc theo thứ tự
  const getColorByIndex = (index) => {
    return colors[index % colors.length]; // Quay lại đầu mảng khi đến cuối
  };

  const { postId } = useParams();
  const { detailJob } = useSelector((store) => store.jobPost);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [openSkill, setOpenSkill] = useState(false);
  const handleOpenSkillModal = () => setOpenSkill(true);
  const handleCloseSkill = () => setOpenSkill(false);
  const [jobData, setJobData] = useState({
    // createDate: "",
    expireDate: "",
    title: "",
    description: "",
    benefit: "",
    experience: "",
    salary: "",
    requirement: "",
    location: "",
    typeOfWork: "",
    position: "",
    // status: "",
    niceToHaves: "",
    skillIds: [], // Danh sách kỹ năng, mặc định là mảng rỗng
  });

  useEffect(() => {
    dispatch(getDetailJobById(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (detailJob) {
      setJobData({
        // Gán giá trị hoặc giá trị mặc định
        expireDate: detailJob.expireDate || "",
        title: detailJob.title || "",
        description: detailJob.description || "",
        benefit: detailJob.benefit || "",
        experience: detailJob.experience || "",
        salary: detailJob.salary || "",
        requirement: detailJob.requirement || "",
        location: detailJob.location || "",
        typeOfWork: detailJob.typeOfWork || "",
        position: detailJob.position || "",
        niceToHaves: detailJob.niceToHaves || "",
        // skillIds: detailJob.skillIds ? [...detailJob.skillIds] : [], // Nếu có danh sách kỹ năng, sao chép sang mảng mới
      });
    }
  }, [detailJob]); // Theo dõi sự thay đổi của jobDetail

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  console.log(jobData);

  const handleSave = async () => {
    // if (!validateForm()) {
    //   return;
    // }
    try {
      await dispatch(updateJob(postId, jobData));
      setIsEditing(false);
      dispatch(getDetailJobById(postId));
      showSuccessToast("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update failed: ", error);
    }
  };
  const [errors, setErrors] = useState({
    emailContact: "",
    phoneNumber: "",
  });

  const validateForm = () => {
    let tempErrors = {
      emailContact: "",
      phoneNumber: "",
    };
    let isValid = true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (jobData.emailContact && !emailRegex.test(jobData.emailContact)) {
      tempErrors.emailContact = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone number (số điện thoại Việt Nam)
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (jobData.phoneNumber && !phoneRegex.test(jobData.phoneNumber)) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const Toast = ({ message, onClose }) => (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in-down z-50">
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  );

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img
              src={detailJob?.company?.logo}
              alt="Company Logo"
              className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
            />
            {isEditing ? (
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-gray-700 font-bold w-1/4">
                    Tiêu đề:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-3/4"
                  />
                </div>

                <div className="flex items-center mb-2 mt-4">
                  <label className="block text-gray-700 font-bold w-1/4">
                    Vị trí cần tuyển:
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={jobData.position}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-3/4 h-24"
                  />
                </div>

                <div className="flex items-center mb-2 mt-4">
                  <label className="block text-gray-700 font-bold w-1/4">
                    Địa chỉ:
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={jobData.location}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-3/4"
                  />
                </div>
                {/* Các trường khác tương tự */}
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold mb-2">{detailJob?.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {detailJob?.position}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {detailJob?.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {detailJob?.approve === false ? (
              isEditing ? (
                <Button variant="outline" onClick={handleSave}>
                  Lưu
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
              )
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Badge
            variant={
              detailJob?.approve
                ? detailJob?.status === "Đang mở"
                  ? "filled"
                  : "outlined"
                : "dot"
            }
            color={
              detailJob?.approve
                ? detailJob?.status === "Đang mở"
                  ? "green"
                  : detailJob?.status === "Đã đóng"
                  ? "orange"
                  : "red"
                : "default"
            }
            className={!detailJob?.approve ? "text-blue-500 font-bold" : ""}
          >
            {detailJob?.approve ? detailJob?.status : "Chưa được duyệt"}
          </Badge>

          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Đã đăng:
            <span>
              {new Date(detailJob?.createDate).toLocaleDateString("vi-VN")}
            </span>
          </span>
          <span className="text-sm text-gray-500">
            Còn:{" "}
            {Math.ceil(
              (new Date(detailJob?.expireDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            ngày
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mô tả công việc</h2>
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded"
                value={jobData.description}
                onChange={handleChange}
                name="description"
              />
            ) : (
              <div className="text-gray-600">
                {detailJob?.description ? (
                  detailJob.description.split("\n").map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="flex-1">{line.trim()}</span>
                    </li>
                  ))
                ) : (
                  <p>Không có mô tả nào được cung cấp.</p>
                )}
              </div>
            )}
          </Card>

          {/* Yêu cầu */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Yêu cầu</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.requirement}
                  onChange={handleChange}
                  name="requirement"
                />
              ) : detailJob?.requirement ? (
                detailJob.requirement.split("\n").map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>
                      {req.charAt(0).toUpperCase() + req.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          {/* Trách nhiệm công việc */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Trách nhiệm công việc
            </h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.niceToHaves}
                  onChange={handleChange}
                  name="niceToHaves"
                />
              ) : detailJob?.niceToHaves ? (
                detailJob.niceToHaves.split("\n").map((nt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>
                      {nt.charAt(0).toUpperCase() + nt.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          {/* Quyền lợi */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quyền lợi</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.benefit}
                  onChange={handleChange}
                  name="benefit"
                />
              ) : detailJob?.benefit ? (
                detailJob.benefit.split("\n").map((be, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>
                      {be.charAt(0).toUpperCase() + be.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Thông tin chung</h3>
            <div className="space-y-4">
              {/* Hạn nộp hồ sơ */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Hạn nộp hồ sơ</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={jobData.expireDate}
                    onChange={handleChange}
                    name="expireDate"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">
                    {new Date(detailJob?.expireDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                )}
              </div>

              {/* Mức lương */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>Mức lương</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={jobData.salary}
                    onChange={handleChange}
                    name="salary"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">
                    {detailJob?.salary
                      ? detailJob.salary.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Chưa có thông tin"}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-gray-500" />
                  <span>Yêu cầu kinh nghiệm</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.experience}
                    onChange={handleChange}
                    name="experience"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">{detailJob?.experience}</span>
                )}
              </div>

              {/* Các phần thống kê khác có thể mở rộng tương tự */}
            </div>
          </Card>

          {/* Required Skills */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Kỹ năng yêu cầu</h3>
              {detailJob?.approve === false ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {detailJob?.skills?.length > 0 ? (
                detailJob.skills.map((skill, index) => (
                  <div
                    key={skill.skillId}
                    className={`${getColorByIndex(
                      index
                    )} bg-opacity-15 rounded-full px-4 py-2 text-sm 
                          flex items-center gap-2 transition-all duration-200 hover:bg-opacity-25`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${getColorByIndex(
                        index
                      )}`}
                    ></span>
                    <span
                      className={`font-medium text-${getColorByIndex(
                        index
                      ).replace("bg-", "")}`}
                    >
                      {skill.skillName}
                    </span>
                  </div>
                ))
              ) : (
                <span>Không có kỹ năng yêu cầu</span> // Thông báo nếu không có kỹ năng
              )}
            </div>
            <section>
              <SkillJobPostModal
                open={openSkill}
                handleClose={handleCloseSkill}
                postId={postId}
              />
            </section>
          </Card>

          {/* Applicants List */}
          {/* <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Danh sách ứng viên</h3>
              <Button variant="outline" size="sm" onClick={() => navigate(`/employer/jobs/${jobId}/applicants`)}>
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-4">
              {jobDetail.applicants.slice(0, 5).map((applicant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant?.avatar || "/default-avatar.png"}
                      alt={applicant?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{applicant?.fullName}</p>
                      <p className="text-sm text-gray-500">
                        Ứng tuyển: {applicant?.applyDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant={applicant?.isSave ? "success" : "secondary"}>
                    {applicant?.isSave ? "Đã duyệt" : "Chưa duyệt"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card> */}
        </div>
      </div>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default JobDetailEmployer;
