import { useEffect, useState } from "react";
import {
  Award,
  Book,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Delete,
  Edit,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  School,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Label } from "../../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import ProfileModal from "./MyProfileModal";
import SkillModal from "./SkillModal";
import ExpModal from "./ExpModal";
import EduModal from "./EduModal";
import { formatDate, formatDateForInput } from "../../utils/dateUtils";
import Swal from "sweetalert2";
import { getIndustry } from "../../redux/Industry/industry.thunk";
import {
  deleteExperience,
  getExpByUser,
} from "../../redux/Experience/exp.thunk";
import { deleteEducation, getEduByUser } from "../../redux/Education/edu.thunk";
import { getProfileAction } from "../../redux/Auth/auth.thunk";
import {
  getSeekerByUser,
  updateSeekerAction,
} from "../../redux/Seeker/seeker.thunk";
import {
  deleteSocialLink,
  fetchSocialLinks,
} from "../../redux/SocialLink/socialLink.thunk";
import SocialLinkModal from "./SocialLinkModal";
import { toast } from "react-toastify";

export default function MyProfile() {
  const colors = [
    "bg-sky-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-green-500",
    "bg-orange-500",
  ];
  const color = [
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-lime-500",
    "bg-amber-500",
    "bg-fuchsia-500",
    "bg-cyan-500",
  ];

  const getColorByIndex = (index) => colors[index % colors.length];
  const getCLByIndex = (index) => color[index % color.length];

  const dispatch = useDispatch();
  const { industries = [] } = useSelector((store) => store.industry || {});

  useEffect(() => {
    dispatch(getIndustry());
  }, [dispatch]);

  const { user = {} } = useSelector((store) => store.auth || {});
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const { seeker = {} } = useSelector((store) => store.seeker || {});
  const { exp = [] } = useSelector((store) => store.exp || {});
  const { edu = [] } = useSelector((store) => store.edu || {});
  const { socialLinks = [] } = useSelector((store) => store.socialLink || {});

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

  const [openSocialLink, setOpenSocialLink] = useState(false);
  const handleOpenSocialLinkModal = () => setOpenSocialLink(true);
  const handleCloseSocialLink = () => {
    setOpenSocialLink(false);
    setRefreshData(true);
  };

  const [socialLinkUpdated, setSocialLinkUpdated] = useState(false);
  const [expUpdated, setExpUpdated] = useState(false);
  const [eduUpdated, setEduUpdated] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    dispatch(getExpByUser());
    dispatch(getEduByUser());
    dispatch(getProfileAction());
    dispatch(getSeekerByUser());
    dispatch(fetchSocialLinks());
    setRefreshData(false);
    setExpUpdated(false);
    setEduUpdated(false);
    setSocialLinkUpdated(false);
  }, [dispatch, refreshData, expUpdated, eduUpdated, socialLinkUpdated]);

  const [isEditingDes, setIsEditingDes] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    email: "",
    phoneNumber: "",
    emailContact: "",
    gender: "",
    dateOfBirth: "",
    industryIds: [],
    background: "bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700",
  });

  const [errors, setErrors] = useState({
    emailContact: "",
    phoneNumber: "",
    dateOfBirth: "",
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
        toast.success("Xóa kinh nghiệm thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa kinh nghiệm:", error);
        toast.error("Xóa kinh nghiệm thất bại. Vui lòng thử lại!");
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
        toast.success("Xóa học vấn thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa học vấn:", error);
        toast.error("Xóa học vấn thất bại. Vui lòng thử lại!");
      }
    }
  };

  const handleDeleteSocialLink = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa link này",
      text: "Bạn có chắc chắn muốn xóa link này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSocialLink(id));
        dispatch(fetchSocialLinks());
        toast.success("Xóa link thành công!");
      } catch (error) {
        toast.error("Xóa link thất bại. Vui lòng thử lại!");
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
        industryIds:
          seeker.industry && Array.isArray(seeker.industry)
            ? seeker.industry
                .filter((ind) => ind?.industryId !== undefined)
                .map((ind) => ind.industryId)
            : [],
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

  const handleEditDesClick = () => setIsEditingDes(true);
  const handleEditInfoClick = () => setIsEditingInfo(true);

  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      await dispatch(
        updateSeekerAction({
          userData: { ...formData, background: selectedBackground },
        })
      );
      setIsEditingDes(false);
      setIsEditingInfo(false);
      dispatch(getSeekerByUser());
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Update failed: ", error);
      toast.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editingSocialLinkId, setEditingSocialLinkId] = useState(null);

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

  const handleEditSocialLink = (socialLink) => {
    setEditingSocialLinkId(socialLink.id);
    setFormData({
      platform: socialLink.platform,
      url: socialLink.url,
    });
    handleOpenSocialLinkModal();
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

  useEffect(() => {
    if (!openSocialLink) {
      setEditingSocialLinkId(null);
      setFormData({
        ...formData,
        platform: "",
        url: "",
      });
    }
  }, [openSocialLink]);

  const validateForm = () => {
    let tempErrors = { emailContact: "", phoneNumber: "", dateOfBirth: "" };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailContact && !emailRegex.test(formData.emailContact)) {
      tempErrors.emailContact = "Email không hợp lệ";
      isValid = false;
    }

    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
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
    setFormData((prev) => ({ ...prev, background: gradient }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Profile Header Card */}
        <Card className="bg-white shadow-lg rounded-lg mb-4 sm:mb-6 w-full">
          <div
            className={`relative h-24 sm:h-32 lg:h-48 ${selectedBackground}`}
          >
            <Button
              size="icon"
              className="absolute right-2 top-2 sm:right-4 sm:top-4 bg-white/20 hover:bg-white/30 p-1 sm:p-2"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            {showColorPicker && (
              <div className="absolute right-2 top-10 sm:right-4 sm:top-12 bg-white p-2 sm:p-3 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-1 gap-2">
                  {backgroundGradients.map((gradient, index) => (
                    <button
                      key={index}
                      className={`h-6 w-20 sm:h-8 sm:w-28 rounded-md ${gradient} hover:opacity-80 transition-opacity`}
                      onClick={() => handleBackgroundChange(gradient)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
            <Avatar className="absolute -top-10 sm:-top-12 h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-4 ring-4 ring-purple-500">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold line-clamp-2">
                  {user?.userName}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {seeker?.address}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleOpenProfileModal}
                className="bg-[#6441a5] text-white hover:bg-[#7f58af] text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 min-w-[120px] sm:min-w-[140px] w-full sm:w-auto"
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>
          <section>
            <ProfileModal
              open={open}
              handleClose={handleClose}
              className="w-full max-w-md sm:max-w-lg p-4 sm:p-6"
            />
          </section>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 xl:gap-8 w-full">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
            {/* About Me */}
            <Card className="bg-white shadow-lg rounded-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  About Me
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditDesClick}
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
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
                      className="border p-2 sm:p-3 w-full min-h-[80px] sm:min-h-[100px] rounded-md resize-none text-sm sm:text-base"
                      placeholder="Nhập mô tả về bản thân..."
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={handleSaveClick}
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 min-w-[80px]"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap break-words">
                    {seeker?.description || "Chưa cập nhật mô tả về bản thân"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            {/* Experience */}
            <Card className="bg-white shadow-lg rounded-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  Kinh nghiệm
                </h3>
                <Button size="icon" variant="ghost">
                  <Plus
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    onClick={handleOpenExpModal}
                  />
                </Button>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-4 pb-4 sm:pb-6 pt-0 space-y-3 sm:space-y-4">
                {exp && exp.length > 0 ? (
                  exp.map((experience, index) => (
                    <div
                      key={index}
                      className="flex gap-1 xs:gap-2 sm:gap-3 p-2 xs:p-3 sm:p-4 bg-white rounded-lg shadow-md border-l-4 transition-all duration-300"
                      style={{ borderLeftColor: getColorByIndex(index) }}
                    >
                      <div
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${getColorByIndex(
                          index
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 max-w-[65%] xs:max-w-[70%] sm:max-w-[75%]">
                            <h4 className="font-semibold text-xs xs:text-sm sm:text-base flex items-center truncate">
                              <Briefcase className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                              <span className="truncate">
                                {experience.jobTitle}
                              </span>
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center mt-1 truncate">
                              <Building className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                              Công ty:{" "}
                              <span className="truncate">
                                {experience.companyName}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-1 xs:gap-1.5 sm:gap-2 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-blue-100"
                              onClick={() => handleEditExperience(experience)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-red-100"
                              onClick={() =>
                                handleDeleteExp(experience.experienceId)
                              }
                              title="Xóa"
                            >
                              <Delete className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center mt-1 xs:mt-2 truncate">
                          <Calendar className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {formatDate(experience.startDate)} -{" "}
                            <span
                              className={
                                experience.endDate
                                  ? ""
                                  : "font-medium text-green-600"
                              }
                            >
                              {experience.endDate
                                ? formatDate(experience.endDate)
                                : "Present"}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 xs:mt-3 p-2 xs:p-3 bg-gray-50 rounded border-l-2 border-gray-200">
                          <div className="flex items-start">
                            <FileText className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                            Mô tả:{" "}
                            <span className="text-blue-600">
                              {experience.description}
                            </span>
                          </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 sm:p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Briefcase className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Chưa cập nhật kinh nghiệm
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs sm:text-sm min-w-[140px]"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Thêm kinh
                      nghiệm
                    </Button>
                  </div>
                )}
              </CardContent>
              <section>
                <ExpModal
                  open={openExp}
                  handleClose={handleCloseExp}
                  editingExperienceId={editingExperienceId}
                  setEditingExperienceId={setEditingExperienceId}
                  initialData={formData}
                  className="w-full max-w-md sm:max-w-lg p-4 sm:p-6"
                />
              </section>
            </Card>

            {/* Education */}
            <Card className="bg-white shadow-lg rounded-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  Học vấn
                </h3>
                <Button size="icon" variant="ghost">
                  <Plus
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    onClick={handleOpenEduModal}
                  />
                </Button>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-4 pb-4 sm:pb-6 pt-0 space-y-3 sm:space-y-4">
                {edu && edu.length > 0 ? (
                  edu.map((education, index) => (
                    <div
                      key={index}
                      className="flex gap-1 xs:gap-2 sm:gap-3 p-2 xs:p-3 sm:p-4 bg-white rounded-lg shadow-md border-l-4 transition-all duration-300"
                      style={{ borderLeftColor: getCLByIndex(index) }}
                    >
                      <div
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${getCLByIndex(
                          index
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 max-w-[65%] xs:max-w-[70%] sm:max-w-[75%]">
                            <h4 className="font-semibold text-xs xs:text-sm sm:text-base flex items-center truncate">
                              <GraduationCap className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                              <span className="truncate">
                                {education.certificateDegreeName}
                              </span>
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center mt-1 truncate">
                              <School className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                              <span className="truncate">
                                {education.universityName}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-1 xs:gap-1.5 sm:gap-2 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-blue-100"
                              onClick={() => handleEditEducation(education)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-red-100"
                              onClick={() =>
                                handleDeleteEdu(education.educationId)
                              }
                              title="Xóa"
                            >
                              <Delete className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center mt-1 xs:mt-2 truncate">
                          <Calendar className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {formatDate(education.startDate)} -{" "}
                            <span
                              className={
                                education.endDate
                                  ? ""
                                  : "font-medium text-green-600"
                              }
                            >
                              {education.endDate
                                ? formatDate(education.endDate)
                                : "Present"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center mt-1 xs:mt-2 truncate">
                          <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500" />
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            Chuyên ngành:{" "}
                            <span className="truncate">{education.major}</span>
                          </p>
                        </div>
                        <div className="mt-2 xs:mt-3 p-2 xs:p-3 bg-gray-50 rounded flex items-center">
                          <Award className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500" />
                          <p className="text-xs sm:text-sm font-medium">
                            GPA:{" "}
                            <span className="text-blue-600">
                              {education.gpa}
                            </span>
                          </p>
                        </div>
                        {education.description && (
                          <div className="mt-2 xs:mt-3 p-2 xs:p-3 bg-gray-50 rounded border-l-2 border-gray-200">
                            <div className="flex items-start">
                              <FileText className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {education.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 sm:p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Không có thông tin giáo dục nào.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs sm:text-sm min-w-[140px]"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Thêm học
                      vấn
                    </Button>
                  </div>
                )}
              </CardContent>
              <section>
                <EduModal
                  open={openEdu}
                  handleClose={handleCloseEdu}
                  editingEducationId={editingEducationId}
                  setEditingEducationId={setEditingEducationId}
                  initialData={formData}
                  className="w-full max-w-md sm:max-w-lg p-4 sm:p-6"
                />
              </section>
            </Card>

            {/* Skills */}
            <Card className="bg-white shadow-lg rounded-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  Kỹ năng
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-3 sm:space-y-4">
                {seeker?.skills &&
                Array.isArray(seeker.skills) &&
                seeker.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {seeker.skills.map((skill, index) => (
                      <div
                        key={skill.skillId}
                        className={`${getColorByIndex(
                          index
                        )} bg-opacity-15 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm flex items-center gap-1 sm:gap-2`}
                      >
                        <span
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getColorByIndex(
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
                  <div className="text-center py-4 sm:py-6 text-gray-500">
                    <Plus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm">
                      Chưa có kỹ năng nào được thêm
                    </p>
                    <p className="text-xs sm:text-sm mt-1">
                      Nhấn vào nút chỉnh sửa để thêm kỹ năng của bạn
                    </p>
                  </div>
                )}
              </CardContent>
              <section>
                <SkillModal
                  open={openSkill}
                  handleClose={handleCloseSkill}
                  className="w-full max-w-md sm:max-w-lg p-4 sm:p-6"
                />
              </section>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-4 sm:space-y-6">
            {/* Contact Info */}
            <Card className="bg-white shadow-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  Thông tin khác
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditInfoClick}
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-3 sm:space-y-4">
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm sm:text-base font-medium">
                      Email
                    </Label>
                    <input
                      name="emailContact"
                      value={formData.emailContact}
                      onChange={handleChange}
                      className={`border p-2 sm:p-3 w-full rounded-md text-sm sm:text-base ${
                        errors.emailContact ? "border-red-500" : ""
                      }`}
                    />
                    {errors.emailContact && (
                      <p className="text-red-500 text-xs sm:text-sm">
                        {errors.emailContact}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.emailContact && (
                    <div>
                      <Label className="text-sm sm:text-base font-medium">
                        Email
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <span className="text-sm sm:text-base truncate">
                          {seeker.emailContact}
                        </span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm sm:text-base font-medium">
                      Số điện thoại
                    </Label>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`border p-2 sm:p-3 w-full rounded-md text-sm sm:text-base ${
                        errors.phoneNumber ? "border-red-500" : ""
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs sm:text-sm">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.phoneNumber && (
                    <div>
                      <Label className="text-sm sm:text-base font-medium">
                        Số điện thoại
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <span className="text-sm sm:text-base truncate">
                          {seeker.phoneNumber}
                        </span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm sm:text-base font-medium">
                      Giới tính
                    </Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="border p-2 sm:p-3 w-full rounded-md text-sm sm:text-base"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                ) : (
                  seeker?.gender && (
                    <div>
                      <Label className="text-sm sm:text-base font-medium">
                        Giới tính
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        {seeker.gender === "Nam" && (
                          <FontAwesomeIcon
                            icon={faMars}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                          />
                        )}
                        {seeker.gender === "Nữ" && (
                          <FontAwesomeIcon
                            icon={faVenus}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                          />
                        )}
                        <span className="text-sm sm:text-base">
                          {seeker.gender}
                        </span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm sm:text-base font-medium">
                      Ngày sinh
                    </Label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`border p-2 sm:p-3 w-full rounded-md text-sm sm:text-base ${
                        errors.dateOfBirth ? "border-red-500" : ""
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs sm:text-sm">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                ) : (
                  seeker?.dateOfBirth && (
                    <div>
                      <Label className="text-sm sm:text-base font-medium">
                        Ngày sinh
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <span className="text-sm sm:text-base">
                          {formatDate(seeker.dateOfBirth)}
                        </span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div className="relative">
                    <Label className="text-sm sm:text-base font-medium">
                      Chuyên ngành
                    </Label>
                    <div
                      className="border p-2 sm:p-3 w-full rounded-md cursor-pointer truncate"
                      onClick={() =>
                        setIsIndustryDropdownOpen(!isIndustryDropdownOpen)
                      }
                    >
                      {(formData?.industryIds ?? []).length > 0
                        ? industries
                            .filter((industry) =>
                              (formData?.industryIds ?? []).includes(
                                industry.industryId
                              )
                            )
                            .map((industry) => industry.industryName)
                            .join(", ")
                        : "Chọn chuyên ngành"}
                    </div>
                    {isIndustryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto">
                        {industries.slice(1).map((industry) => (
                          <label
                            key={industry.industryId}
                            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 mr-2 sm:mr-3"
                              checked={(formData.industryIds ?? []).includes(
                                industry.industryId
                              )}
                              onChange={(e) => {
                                const newIndustryIds = e.target.checked
                                  ? [
                                      ...(formData.industryIds ?? []),
                                      industry.industryId,
                                    ]
                                  : (formData.industryIds ?? []).filter(
                                      (id) => id !== industry.industryId
                                    );
                                setFormData((prev) => ({
                                  ...prev,
                                  industryIds: newIndustryIds,
                                }));
                              }}
                            />
                            <span className="text-sm sm:text-base truncate">
                              {industry.industryName}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  seeker?.industry &&
                  seeker.industry.length > 0 && (
                    <div>
                      <Label className="text-sm sm:text-base font-medium">
                        Chuyên ngành
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Book className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <span className="text-sm sm:text-base truncate">
                          {seeker.industry
                            .map((industry) => industry.industryName)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
              {isEditingInfo && (
                <div className="mt-2 sm:mt-4 mr-3 sm:mr-4 mb-3 sm:mb-4 flex justify-end">
                  <Button
                    onClick={handleSaveClick}
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4 min-w-[80px]"
                  >
                    Lưu
                  </Button>
                </div>
              )}
            </Card>

            {/* Social Links */}
            <Card className="bg-white shadow-lg w-full">
              <CardHeader className="flex flex-row items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg lg:text-xl text-purple-600 font-semibold">
                  Liên kết xã hội
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSocialLinkModal}
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md-custom:px-3.5 pb-4 sm:pb-6 pt-0 space-y-3 sm:space-y-4">
                {socialLinks &&
                Array.isArray(socialLinks) &&
                socialLinks.length > 0 ? (
                  socialLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex gap-2 sm:gap-3 md-custom:gap-2.5 p-1.5 sm:p-2 md-custom:p-2 bg-white rounded-lg shadow-md social-link-container"
                    >
                      <div
                        className="platform-icon-container"
                        style={{ width: "28px", height: "28px", flexShrink: 0 }}
                      >
                        <img
                          src={require(`../../assets/images/platforms/${link.platform.toLowerCase()}.png`)}
                          alt={link.platform.toLowerCase()}
                          className="h-full w-full object-contain rounded-full shadow-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between w-full">
                          <div className="truncate min-w-0 flex-1 max-w-[60%] sm:max-w-[65%] social-link-content">
                            <Label className="text-xs sm:text-sm md-custom:text-sm font-medium">
                              {link.platform}
                            </Label>
                            <a
                              href={link.url}
                              className="text-xs sm:text-sm md-custom:text-sm text-blue-600 truncate block"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.url}
                            </a>
                          </div>
                          <div className="flex gap-1 sm:gap-1.5 md-custom:gap-1 flex-shrink-0 ml-1.5 sm:ml-2 social-link-buttons">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4 sm:h-5 sm:w-5 md-custom:h-5 md-custom:w-5 lg:h-6 lg:w-6 hover:bg-blue-100"
                              onClick={() => handleEditSocialLink(link)}
                            >
                              <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 md-custom:h-3 md-custom:w-3 lg:h-4 lg:w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4 sm:h-5 sm:w-5 md-custom:h-5 md-custom:w-5 lg:h-6 lg:w-6 hover:bg-red-100"
                              onClick={() => handleDeleteSocialLink(link.id)}
                            >
                              <Delete className="h-2.5 w-2.5 sm:h-3 sm:w-3 md-custom:h-3 md-custom:w-3 lg:h-4 lg:w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 sm:py-6 text-gray-500">
                    <p className="text-xs sm:text-sm">
                      Không có liên kết xã hội nào
                    </p>
                  </div>
                )}
              </CardContent>
              <section>
                <SocialLinkModal
                  open={openSocialLink}
                  handleClose={handleCloseSocialLink}
                  editingSocialLinkId={editingSocialLinkId}
                  setEditingSocialLinkId={setEditingSocialLinkId}
                  initialData={formData}
                  className="w-full max-w-md sm:max-w-lg p-4 sm:p-6"
                />
              </section>
            </Card>
          </div>
        </div>
      </main>
      <style jsx>{`
        .experience-container,
        .education-container {
          transition: all 0.3s ease;
        }
        .experience-buttons,
        .education-buttons {
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) and (max-width: 1000px) {
          .experience-container,
          .education-container {
            padding: 0.75rem;
            gap: 1rem;
          }
          .experience-content,
          .education-content {
            font-size: 0.875rem;
            max-width: 70%;
          }
          .experience-buttons,
          .education-buttons {
            gap: 0.75rem;
          }
          .experience-buttons button,
          .education-buttons button {
            height: 1.5rem;
            width: 1.5rem;
            min-height: 1.5rem;
            min-width: 1.5rem;
          }
          .experience-buttons svg,
          .education-buttons svg {
            height: 1rem;
            width: 1rem;
          }
        }
        @media (max-width: 767px) {
          .experience-container,
          .education-container {
            padding: 0.5rem;
            gap: 0.75rem;
          }
          .experience-content,
          .education-content {
            font-size: 0.75rem;
            max-width: 65%;
          }
          .experience-buttons,
          .education-buttons {
            gap: 0.5rem;
          }
          .experience-buttons button,
          .education-buttons button {
            height: 1.5rem;
            width: 1.5rem;
            min-height: 1.5rem;
            min-width: 1.5rem;
            padding: 0.25rem;
          }
          .experience-buttons svg,
          .education-buttons svg {
            height: 1rem;
            width: 1rem;
          }
        }
        @media (max-width: 640px) {
          .experience-container,
          .education-container {
            padding: 0.5rem;
            gap: 0.5rem;
          }
          .experience-content,
          .education-content {
            font-size: 0.75rem;
            max-width: 60%;
          }
          .experience-buttons,
          .education-buttons {
            gap: 0.5rem;
          }
        }
        @media (min-width: 1280px) {
          .main-container {
            max-width: 1400px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
