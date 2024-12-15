import { useEffect, useState } from "react";
import {
  Book,
  Calendar,
  Delete,
  Edit,
  LogOut,
  Mail,
  Phone,
  Plus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../redux/store";
import {
  getSeekerByUser,
  updateSeekerAction,
} from "../../redux/Seeker/seeker.action";
import { GenIcon } from "react-icons/lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import {
  deleteExperience,
  getExpByUser,
} from "../../redux/Experience/exp.action";
import {
  deleteEducation,
  getEduByUser,
} from "../../redux/Education/edu.action";
import ProfileModal from "./MyProfileModal";
import { getProfileAction } from "../../redux/Auth/auth.action";
import SkillModal from "./SkillModal";
import ExpModal from "./ExpModal";
import EduModal from "./EduModal";
import { getIndustry } from "../../redux/Industry/industry.action";
import { formatDate, formatDateForInput } from "../../utils/dateUtils";
import Swal from "sweetalert2";

export default function MyProfile() {
  const colors = [
    "bg-sky-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-green-500",
    "bg-orange-500",
  ];

  const color = [
    "bg-pink-500", // màu hồng
    "bg-teal-500", // màu xanh ngọc
    "bg-indigo-500", // màu chàm
    "bg-lime-500", // màu xanh lá sáng
    "bg-amber-500", // màu hổ phách
    "bg-fuchsia-500", // màu hồng tím
    "bg-cyan-500", // màu lục lam
  ];

  // Hàm lấy màu sắc theo thứ tự
  const getColorByIndex = (index) => {
    return colors[index % colors.length]; // Quay lại đầu mảng khi đến cuối
  };

  const getCLByIndex = (index) => {
    return color[index % color.length]; // Quay lại đầu mảng khi đến cuối
  };

  const dispatch = useDispatch();
  const { industries } = useSelector((store) => store.industry);

  useEffect(() => {
    dispatch(getIndustry());
  }, [dispatch]);

  const { user } = useSelector((store) => store.auth);
  const { seeker } = useSelector((store) => store.seeker);
  const { exp } = useSelector((store) => store.exp);
  const { edu } = useSelector((store) => store.edu);

  const [open, setOpen] = useState(false);
  const handleOpenProfileModal = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openSkill, setOpenSkill] = useState(false);
  const handleOpenSkillModal = () => setOpenSkill(true);
  const handleCloseSkill = () => setOpenSkill(false);

  const [openExp, setOpenExp] = useState(false);
  const handleOpenExpModal = () => setOpenExp(true);
  const handleCloseExp = () => {
    setOpenExp(false);
    setRefreshData(true);
  };

  const [openEdu, setOpenEdu] = useState(false);
  const handleOpenEduModal = () => setOpenEdu(true);
  const handleCloseEdu = () => {
    setOpenEdu(false);
    setRefreshData(true);
  };

  const [expUpdated, setExpUpdated] = useState(false);
  const [eduUpdated, setEduUpdated] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    dispatch(getExpByUser());
    dispatch(getEduByUser());
    dispatch(getProfileAction());
    dispatch(getSeekerByUser());
    setRefreshData(false);
    setExpUpdated(false);
    setEduUpdated(false);
  }, [dispatch, refreshData, expUpdated, eduUpdated]);

  const [isEditingDes, setIsEditingDes] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    email: "",
    phoneNumber: "",
    emailContact: "",
    gender: "",
    dateOfBirth: "",
    industryId: "",
    background: "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700",
  });

  const [errors, setErrors] = useState({
    emailContact: "",
    phoneNumber: "",
  });

  const handleDeleteExp = async (experienceId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa kinh nghiệm",
      text: "Bạn có chắc chắn muốn xóa kinh nghiệm này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteExperience(experienceId));
        dispatch(getExpByUser());
        showSuccessToast("Xóa kinh nghiệm thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa kinh nghiệm:", error);
        showSuccessToast(
          "Xóa kinh nghiệm thất bại. Vui lòng thử lại!",
          "error"
        );
      }
    }
  };

  const handleDeleteEdu = async (educationId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa học vấn",
      text: "Bạn có chắc chắn muốn xóa học vấn này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteEducation(educationId));
        dispatch(getEduByUser());
        showSuccessToast("Xóa học vấn thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa học vấn:", error);
        showSuccessToast("Xóa học vấn thất bại. Vui lòng thử lại!", "error");
      }
    }
  };

  useEffect(() => {
    if (seeker) {
      setFormData({
        description: seeker.description || "",
        email: seeker.email || "",
        phoneNumber: seeker.phoneNumber || "",
        emailContact: seeker.emailContact || "",
        gender: seeker.gender || "",
        dateOfBirth: seeker.dateOfBirth || "",
        industryId: seeker.industry ? seeker.industry.industryId : "",
        background:
          seeker.background ||
          "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700",
      });
      setSelectedBackground(
        seeker.background ||
          "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700"
      );
    }
  }, [seeker]);

  const handleEditDesClick = () => {
    setIsEditingDes(true);
  };

  const handleEditInfoClick = () => {
    setIsEditingInfo(true);
  };

  const handleSaveClick = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await dispatch(
        updateSeekerAction({
          ...formData,
          background: selectedBackground,
        })
      );
      setIsEditingDes(false);
      setIsEditingInfo(false);
      dispatch(getSeekerByUser());
      showSuccessToast("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update failed: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value); // Kiểm tra giá tr
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Cập nhật giá trị cho trường tương ứng
    }));
  };

  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);

  const handleEditEducation = (education) => {
    setEditingEducationId(education.educationId);
    setFormData({
      certificateDegreeName: education.certificateDegreeName,
      major: education.major,
      universityName: education.universityName,
      startDate: formatDateForInput(education.startDate),
      endDate: formatDateForInput(education.endDate),
      gpa: education.gpa,
    });
    handleOpenEduModal();
  };

  const handleEditExperience = (experience) => {
    setEditingExperienceId(experience.experienceId);
    setFormData({
      startDate: formatDateForInput(experience.startDate),
      endDate: formatDateForInput(experience.endDate),
      jobTitle: experience.jobTitle,
      companyName: experience.companyName,
      description: experience.description,
    });
    handleOpenExpModal();
  };

  const handleDeleteExperience = (experienceId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa kinh nghiệm này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteExperience(experienceId))
          .then(() => {
            setRefreshData(true);
          })
          .catch((error) => {
            console.error("Error deleting experience:", error);
          });
      }
    });
  };

  const handleDeleteEducation = (educationId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa thông tin giáo dục này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteEducation(educationId))
          .then(() => {
            setRefreshData(true);
          })
          .catch((error) => {
            console.error("Error deleting education:", error);
          });
      }
    });
  };

  useEffect(() => {
    if (!openExp) {
      setEditingExperienceId(null);
      setFormData({
        ...formData,
        jobTitle: "",
        companyName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [openExp]);

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

  useEffect(() => {
    if (!openEdu) {
      setEditingEducationId(null);
      setFormData({
        ...formData,
        certificateDegreeName: "",
        major: "",
        universityName: "",
        startDate: "",
        endDate: "",
        gpa: "",
      });
    }
  }, [openEdu]);

  const validateForm = () => {
    let tempErrors = {
      emailContact: "",
      phoneNumber: "",
      dateOfBirth: "",
    };
    let isValid = true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailContact && !emailRegex.test(formData.emailContact)) {
      tempErrors.emailContact = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone number (số điện thoại Việt Nam)
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    // Validate date of birth (must be at least 18 years old)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      // Adjust age calculation if birthday hasn't occurred yet this year
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Nếu tuổi nhỏ hơn 18 thì báo lỗi, nếu bằng 18 tuổi (hoặc lớn hơn) thì tính là đủ
      if (age < 18) {
        tempErrors.dateOfBirth = "Bạn phải đủ 18 tuổi";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(
    "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700"
  );

  const backgroundGradients = [
    "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700",
    "bg-gradient-to-r from-cyan-200 via-blue-300 to-blue-700",
    "bg-gradient-to-r from-green-200 via-teal-300 to-teal-700",
    "bg-gradient-to-r from-yellow-200 via-orange-300 to-orange-700",
    "bg-gradient-to-r from-red-200 via-rose-300 to-rose-700",
  ];

  const handleBackgroundChange = (gradient) => {
    setSelectedBackground(gradient);
    setShowColorPicker(false);
    setFormData((prev) => ({
      ...prev,
      background: gradient,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 -ml-8 -mr-8 ">
      <main className="container mx-auto p-6">
        {/* Profile Header Card */}
        <Card className="bg-white shadow-lg rounded-lg mb-6">
          <div className={`relative h-48 ${selectedBackground}`}>
            <Button
              size="icon"
              className="absolute right-4 top-4 bg-white/20 hover:bg-white/30"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            {showColorPicker && (
              <div className="absolute right-4 top-16 bg-white p-3 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-1 gap-2">
                  {backgroundGradients.map((gradient, index) => (
                    <button
                      key={index}
                      className={`h-8 w-32 rounded-md ${gradient} hover:opacity-80 transition-opacity`}
                      onClick={() => handleBackgroundChange(gradient)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative px-6 pb-6">
            <Avatar className="absolute -top-16 h-32 w-32 border-4 ring-4 ring-purple-500">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{user?.userName}</h2>
                <p className="text-muted-foreground">{seeker.address}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleOpenProfileModal}
                className="bg-[#6441a5] text-white hover:bg-[#7f58af] transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>

          <section>
            <ProfileModal open={open} handleClose={handleClose} />
          </section>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* About Me */}
            <Card className="bg-white shadow-lg rounded-lg mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg text-purple-600 font-semibold">
                  About Me
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditDesClick}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent>
                {isEditingDes ? (
                  <div>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveClick();
                        }
                      }}
                      className="border p-2 w-full min-h-[100px] rounded-md resize-none"
                      placeholder="Nhập mô tả về bản thân..."
                    />
                    <div className="mt-2 flex justify-end">
                      <Button onClick={handleSaveClick}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {seeker.description
                      ? seeker.description
                      : "Chưa cập nhật mô tả về bản thân"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-white shadow-lg rounded-lg mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg text-purple-600 font-semibold">
                  Kinh nghiệm
                </h3>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" onClick={handleOpenExpModal} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {exp && exp.length > 0 ? (
                  exp.map((experience, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                        className={`h-12 w-12 rounded-full ${getColorByIndex(
                          index
                        )} shadow-md`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {experience.jobTitle}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Công ty: {experience.companyName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:bg-blue-100 transition-colors duration-200"
                              onClick={() => handleEditExperience(experience)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:bg-red-100 transition-colors duration-200"
                              onClick={() =>
                                handleDeleteExp(experience.experienceId)
                              }
                            >
                              <Delete className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {formatDate(experience.startDate)} -{" "}
                          {experience.endDate
                            ? formatDate(experience.endDate)
                            : "Present"}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {experience.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa cập nhật kinh nghiệm
                  </p>
                )}
              </CardContent>

              <section>
                <ExpModal
                  open={openExp}
                  handleClose={handleCloseExp}
                  editingExperienceId={editingExperienceId}
                  setEditingExperienceId={setEditingExperienceId}
                  initialData={formData}
                  showSuccessToast={showSuccessToast}
                />
              </section>
            </Card>

            {/* Education */}
            <Card className="bg-white shadow-lg rounded-lg mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg  text-purple-600 font-semibold">
                  Học vấn
                </h3>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" onClick={handleOpenEduModal} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {edu && edu.length > 0 ? (
                  edu.map((education, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                        className={`h-12 w-12 rounded-full ${getCLByIndex(
                          index
                        )} shadow-md`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {education.certificateDegreeName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {education.universityName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:bg-blue-100 transition-colors duration-200"
                              onClick={() => handleEditEducation(education)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:bg-red-100 transition-colors duration-200"
                              onClick={() =>
                                handleDeleteEdu(education.educationId)
                              }
                            >
                              <Delete className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {formatDate(education.startDate)} -{" "}
                          {education.endDate
                            ? formatDate(education.endDate)
                            : "Present"}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {education.major}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          GPA: {education.gpa}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Không có thông tin giáo dục nào.
                  </p>
                )}
              </CardContent>
              <section>
                <EduModal
                  open={openEdu}
                  handleClose={handleCloseEdu}
                  editingEducationId={editingEducationId}
                  setEditingEducationId={setEditingEducationId}
                  initialData={formData}
                  showSuccessToast={showSuccessToast}
                />
              </section>
            </Card>

            {/* Skills */}
            <Card className="bg-white shadow-lg rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg  text-purple-600 font-semibold">
                    Kỹ năng
                  </h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {seeker.skills &&
                Array.isArray(seeker.skills) &&
                seeker.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {seeker.skills.map((skill, index) => (
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="mb-2">
                      <Plus className="h-12 w-12 mx-auto text-gray-400" />
                    </div>
                    <p className="text-sm">Chưa có kỹ năng nào được thêm</p>
                    <p className="text-xs mt-1">
                      Nhấn vào nút chỉnh sửa để thêm kỹ năng của bạn
                    </p>
                  </div>
                )}
              </CardContent>
              <section>
                <SkillModal open={openSkill} handleClose={handleCloseSkill} />
              </section>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg text-purple-600 font-semibold">
                  Thông tin khác
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditInfoClick}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm font-medium whitespace-nowrap">
                      Email
                    </Label>
                    <input
                      name="emailContact"
                      value={formData.emailContact}
                      onChange={handleChange}
                      className={`border p-2 w-full mt-1 ${
                        errors.emailContact ? "border-red-500" : ""
                      }`}
                    />
                    {errors.emailContact && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.emailContact}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.emailContact && (
                    <div>
                      <Label
                        className="text-sm font-medium"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Email
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{seeker.emailContact}</span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div className="mb-4">
                    <Label
                      className="text-sm font-medium block mb-1"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Số điện thoại
                    </Label>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`border p-2 w-full ${
                        errors.phoneNumber ? "border-red-500" : ""
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.phoneNumber && (
                    <div>
                      <Label className="text-sm font-medium">
                        Số điện thoại
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{seeker.phoneNumber}</span>
                      </div>
                    </div>
                  )
                )}

                {isEditingInfo ? (
                  <div className="mb-4">
                    <Label className="text-sm font-medium block mb-1 whitespace-nowrap">
                      Giới tính
                    </Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                ) : (
                  seeker?.gender && (
                    <div>
                      <Label className="text-sm font-medium whitespace-nowrap">
                        Giới tính
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        {seeker.gender === "Nam" && (
                          <FontAwesomeIcon
                            icon={faMars}
                            className="h-4 w-4 text-muted-foreground"
                          />
                        )}
                        {seeker.gender === "Nữ" && (
                          <FontAwesomeIcon
                            icon={faVenus}
                            className="h-4 w-4 text-muted-foreground"
                          />
                        )}
                        <span className="text-sm">{seeker.gender}</span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div className="mb-4">
                    <Label className="text-sm font-medium block mb-1 whitespace-nowrap">
                      Ngày sinh
                    </Label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`border p-2 w-full ${
                        errors.dateOfBirth ? "border-red-500" : ""
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium whitespace-nowrap">
                        Ngày sinh
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(seeker.dateOfBirth)}
                        </span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div className="mb-4">
                    <Label className="text-sm font-medium block mb-1 whitespace-nowrap">
                      Chuyên ngành
                    </Label>
                    <select
                      name="industryId"
                      value={formData.industryId}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    >
                      <option value="">Chọn chuyên ngành</option>
                      {industries.slice(1).map((industry) => (
                        <option
                          key={industry.industryId}
                          value={industry.industryId}
                        >
                          {industry.industryName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  seeker?.industry &&
                  seeker.industry.industryId !== 0 && (
                    <div>
                      <Label className="text-sm font-medium whitespace-nowrap">
                        Major
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {seeker.industry.industryName}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
              {isEditingInfo && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSaveClick}>Lưu</Button>
                </div>
              )}
            </Card>

            {/* Social Links */}
            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg  text-purple-600 font-semibold">
                  Liên kết xã hội
                </h3>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {seeker.socialLinks &&
                Array.isArray(seeker.socialLinks) &&
                seeker.socialLinks.length > 0 ? (
                  seeker.socialLinks.map((link, index) => (
                    <div key={index}>
                      <Label className="text-sm font-medium">
                        {link.socialName}
                      </Label>
                      <br />
                      <a
                        href={link.link}
                        className="text-sm text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.link}
                      </a>
                    </div>
                  ))
                ) : (
                  <div>Không có liên kết xã hội nào</div> // Hiển thị thông báo nếu không có liên kết mạng xã hội
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
