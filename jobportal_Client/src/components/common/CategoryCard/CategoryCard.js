import React, { useState } from "react";
import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import Swal from "sweetalert2";

const CategoryCard = ({ icon, title, jobCount, isActive, industryId }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleCardClick = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập để xem công việc theo danh mục",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth/sign-in");
        }
      });
      return;
    }

    // Kiểm tra industryId hợp lệ
    if (!industryId) {
      console.error("industryId is invalid");
      return;
    }

    // Tạo filters để lưu vào sessionStorage
    const filters = {
      title: "",
      selectedTypesOfWork: [],
      cityId: "",
      selectedIndustryIds: [industryId],
      minSalary: null,
      maxSalary: null,
    };

    // Lưu filters vào sessionStorage
    sessionStorage.setItem("searchFilters", JSON.stringify(filters));

    // Điều hướng đến trang find-jobs với state
    navigate("/find-jobs", {
      state: {
        selectedIndustryIds: [industryId],
      },
    });
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    navigate("/auth/sign-in");
  };

  return (
    <>
      <div
        className={`category-card ${isActive ? "active" : ""}`}
        onClick={handleCardClick}
      >
        <div className="icon">
          <img src={icon} alt={title} />
        </div>
        <div className="category-info">
          <h3 className="category-title font-bold">{title}</h3>
          <p className="job-count text-[16px]" style={{ color: "#a86d36" }}>
            {jobCount} công việc
          </p>
        </div>
        <div className="arrow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center text-gray-800">
              Yêu cầu đăng nhập
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để xem công việc theo danh mục
            </p>
          </div>
          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleLoginRedirect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Đăng nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryCard;