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
  const { industries} = useSelector(store => store.industry);

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
  const handleCloseExp = () => setOpenExp(false);

  const [openEdu, setOpenEdu] = useState(false);
  const handleOpenEduModal = () => setOpenEdu(true);
  const handleCloseEdu = () => setOpenEdu(false);

  useEffect(() => {
    dispatch(getExpByUser());
    dispatch(getEduByUser());
    dispatch(getProfileAction());
    dispatch(getSeekerByUser());
  }, [dispatch]);

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
  });

  const handleDeleteExp = async (experienceId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kinh nghiệm này?")) {
      try {
        await dispatch(deleteExperience(experienceId));

        dispatch(getExpByUser());
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa kinh nghiệm:", error);
        alert("Xóa không thành công. Vui lòng thử lại!");
      }
    }
  };
  const handleDeleteEdu = async (educationId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học vấn này?")) {
      try {
        await dispatch(deleteEducation(educationId));

        dispatch(getEduByUser());
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa học vấn:", error);
        alert("Xóa không thành công. Vui lòng thử lại!");
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
        industryId: seeker.industry ? seeker.industry.industryId : "", // Kiểm tra industry
      });
    }
  }, [seeker]);

  const handleEditDesClick = () => {
    setIsEditingDes(true);
  };

  const handleEditInfoClick = () => {
    setIsEditingInfo(true);
  };

  const handleSaveClick = async () => {
    try {
      await dispatch(updateSeekerAction(formData)); // Đợi update hoàn thành
      setIsEditingDes(false);
      setIsEditingInfo(false);
      dispatch(getSeekerByUser()); // Sau khi cập nhật, gọi getSeekerByUser
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

  return (
    <div className="min-h-screen bg-gray-50 -ml-8 -mr-8 ">
      <main className="container mx-auto p-6">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <div className="relative h-48 bg-gradient-to-r from-pink-200 via-purple-300 to-purple-700">
            <Button
              size="icon"
              className="absolute right-4 top-4 bg-white/20 hover:bg-white/30"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative px-6 pb-6">
            <Avatar className="absolute -top-16 h-32 w-32 border-4 border-white">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="mb-4 pt-20 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{user?.userName}</h2>
                <p className="text-muted-foreground">{seeker.address}</p>
              </div>
              <Button variant="outline" onClick={handleOpenProfileModal}>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">About Me</h3>
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
                    <input
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button onClick={handleSaveClick}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {seeker.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Experiences</h3>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" onClick={handleOpenExpModal} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {exp?.map((experience, index) => (
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
                      <p className="mt-2 text-sm text-gray-600">
                        {experience.startDate} •{" "}
                        {experience.endDate || "Present"}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <section>
                <ExpModal open={openExp} handleClose={handleCloseExp} />
              </section>
            </Card>

            {/* Education */}
            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
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
                              {education.universityName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {education.certificateDegreeName}
                            </p>
                          </div>
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
                        <p className="mt-2 text-sm text-gray-600">
                          {education.startDate} •{" "}
                          {education.endDate || "Present"}
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
                <EduModal open={openEdu} handleClose={handleCloseEdu} />
              </section>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Skills</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {seeker.skills && Array.isArray(seeker.skills) ? (
                    seeker.skills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                      >
                        {skill.skillName}
                      </div>
                    ))
                  ) : (
                    <div>No skills available</div> // Hiển thị thông báo nếu không có kỹ năng
                  )}
                </div>
              </CardContent>
              <section>
                <SkillModal open={openSkill} handleClose={handleCloseSkill} />
              </section>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Thông tin khác</h3>
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
                    <Label className="text-sm font-medium">Email</Label>
                    <input
                      name="emailContact"
                      value={formData.emailContact}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                ) : (
                  seeker?.emailContact && (
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{seeker.emailContact}</span>
                      </div>
                    </div>
                  )
                )}

                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                ) : (
                  seeker?.phoneNumber && (
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{seeker.phoneNumber}</span>
                      </div>
                    </div>
                  )
                )}

                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    >
                      <option value="">Select Gender</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                ) : (
                  seeker?.gender && (
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
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
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    />
                  </div>
                ) : (
                  seeker?.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium">
                        Date of Birth
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{seeker.dateOfBirth}</span>
                      </div>
                    </div>
                  )
                )}
                {isEditingInfo ? (
                  <div>
                    <Label className="text-sm font-medium">Major</Label>
                    <select
                      name="industryId"
                      value={formData.industryId}
                      onChange={handleChange}
                      className="border p-2 w-full"
                    >
                      <option value="">Select Industry</option>
                      {industries.slice(1).map((industry) => (
                        <option key={industry.industryId} value={industry.industryId}>
                          {industry.industryName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  seeker?.industry && (
                    <div>
                      <Label className="text-sm font-medium">Major</Label>
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
                  <Button onClick={handleSaveClick}>Save</Button>
                </div>
              )}
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Social Links</h3>
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
                  <div>No social links available</div> // Hiển thị thông báo nếu không có liên kết mạng xã hội
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
