import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import {
  Users,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  UserCheck,
  MapPin,
  Briefcase,
  Users2,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Link,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Banknote } from "lucide-react";
import { StarRounded } from "@mui/icons-material";
import {
  deleteCompany,
  getCompanyById,
  getCompanyJobCounts,
  getCompanyJobStats,
  getCompanyProfile,
  updateCompanyStatus,
} from "../../../redux/Company/company.thunk";
import { getReviewByCompany } from "../../../redux/Review/review.thunk";
import { fetchSocialLinksByUserId } from "../../../redux/SocialLink/socialLink.thunk";
import BlockedCompanyModal from "../../../components/BlockedCompany/BlockedCompanyModal";
import Swal from "sweetalert2";
import {
  getProfileAction,
  unblockCompany,
} from "../../../redux/Auth/auth.thunk";

export default function CompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const { companyProfile, jobCounts, jobStats, loading } = useSelector(
    (store) => store.company
  );
  const [isBlocked, setIsBlocked] = useState(companyProfile?.isBlocked);
  const [open, setOpen] = useState(false);
  const { socialLinks } = useSelector((store) => store.socialLink);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chartDateRange, setChartDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });
  const [activePeriod, setActivePeriod] = useState("week");
  const chartRef = useRef(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const { reviews } = useSelector((store) => store.review);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1485;
  const fontSize = isMobile ? "text-[0.8125rem]" : "text-sm";
  const padding = isMobile ? "p-2.5" : isMidRange ? "p-3" : "p-4";

  useEffect(() => {
    dispatch(getCompanyProfile(companyId));
    dispatch(getCompanyJobCounts(companyId));
    dispatch(getReviewByCompany(companyId));
    dispatch(fetchSocialLinksByUserId(companyId));
    return () => setIsMounted(false);
  }, [dispatch, companyId]);

  useEffect(() => {
    setIsBlocked(companyProfile?.isBlocked);
  }, [companyProfile]);

  useEffect(() => {
    if (chartDateRange.startDate && chartDateRange.endDate) {
      const start = new Date(chartDateRange.startDate);
      const end = new Date(chartDateRange.endDate);
      const today = new Date();

      if (start > end) {
        setDateError("Ngày bắt đầu không thể sau ngày kết thúc");
        return;
      }
      if (end > today) {
        setDateError("Ngày kết thúc không thể sau ngày hiện tại");
        return;
      }

      setDateError("");
      setIsChartLoading(true);
      setError(null);

      dispatch(
        getCompanyJobStats({
          companyId,
          startDate: chartDateRange.startDate,
          endDate: chartDateRange.endDate,
        })
      )
        .unwrap()
        .then((payload) => {
          if (!payload) throw new Error("Không có dữ liệu từ API");
          setIsChartLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
          setIsChartLoading(false);
        });
    }
  }, [dispatch, companyId, chartDateRange]);

  useEffect(() => {
    if (!companyProfile || companyProfile.companyId !== companyId) {
      dispatch(getCompanyById(companyId));
      dispatch(getCompanyJobCounts(companyId));
    }
    return () => setIsMounted(false);
  }, [dispatch, companyId, companyProfile]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async () => {
    try {
      await dispatch(deleteCompany(companyId));
      navigate("/admin/companies");
      toast.success("Xóa công ty thành công");
    } catch (error) {
      toast.error("Không thể xóa công ty");
    }
  };

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange((prev) => ({ ...prev, [name]: value }));
    setDateError("");
  };

  const handlePeriodFilter = (period) => {
    const end = new Date();
    const start = new Date();
    switch (period) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        break;
    }
    setActivePeriod(period);
    setChartDateRange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
    scrollToChart();
  };

  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const chartData = useMemo(() => {
    if (!jobStats || !Array.isArray(jobStats)) return [];
    return jobStats
      .map((stat) => {
        try {
          if (!stat.date) return null;
          const date = new Date(stat.date);
          return {
            date: date.toISOString().split("T")[0],
            fullDate: date.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            totalJobs: Number(stat.totalJobs) || 0,
            activeJobs: Number(stat.activeJobs) || 0,
            closedJobs: Number(stat.closedJobs) || 0,
            pendingJobs: Number(stat.pendingJobs) || 0,
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }, [jobStats]);

  const ChartSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-[200px] custom-800:h-[250px] custom-1360:h-[300px] bg-gray-200 rounded"></div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen max-w-full">
        <div className="animate-spin rounded-full h-8 w-8 custom-800:h-10 custom-800:w-10 custom-1360:h-12 custom-1360:w-12 border-b-2 border-purple-600"></div>
      </div>
    );

  const handleOpenBlockModal = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenUnBlockModal = async () => {
    Swal.fire({
      title: "Bạn có muốn mở khóa tài khoản không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, mở khóa!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      customClass: { popup: "swal2-responsive" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Đang xử lý...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        try {
          await dispatch(unblockCompany({ companyId }));
          Swal.fire("Thành công!", "Tài khoản đã được mở khóa.", "success");
          dispatch(getCompanyProfile(companyId));
        } catch (error) {
          Swal.fire("Lỗi!", "Đã có lỗi xảy ra, vui lòng thử lại.", "error");
        }
      }
    });
  };

  
  return (
    <div className="min-h-screen bg-gray-50 py-4 custom-1360:py-8 max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <Button
            variant="ghost"
            className={`flex items-center gap-2 hover:bg-purple-100 w-[185px] ${
              isMobile ? "px-3 py-1.5" : "px-4 py-2"
            } hover:shadow-lg justify-start text-left`}
            onClick={() => navigate("/admin/company-list")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className={fontSize}>Trở lại danh sách</span>
          </Button>

          <div className="flex flex-col custom-800:flex-row custom-800:items-center custom-800:justify-between gap-3 custom-1360:gap-4">
            <h1 className="text-xl custom-800:text-2xl custom-1360:text-3xl font-bold text-left">
              {companyProfile?.companyName || "N/A"}
            </h1>
            <Button
              variant={companyProfile?.isBlocked ? "destructive" : "success"}
              onClick={
                companyProfile?.isBlocked
                  ? handleOpenUnBlockModal
                  : handleOpenBlockModal
              }
              className={`flex items-center gap-2 custom-800:ml-auto ${
                companyProfile?.isBlocked
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } ${isMobile ? "px-3 py-1.5" : "px-4 py-2"} hover:shadow-lg`}
            >
              {companyProfile?.isBlocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span className={fontSize}>Mở khóa tài khoản</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className={fontSize}>Khóa tài khoản</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Thống Kê */}
        <div className="grid grid-cols-1 custom-800:grid-cols-2 custom-1360:grid-cols-4 gap-4 custom-1360:gap-6 mb-6">
          {[
            {
              icon: FileText,
              label: "Tổng bài đăng",
              value: jobCounts?.totalJobs || 0,
              gradient: "from-[#3cc99c]/80 to-[#185a9d]/80",
            },
            {
              icon: UserCheck,
              label: "Tin đang tuyển",
              value: jobCounts?.activeJobs || 0,
              gradient: "from-[#FFA17F]/80 to-[#00223E]/80",
            },
            {
              icon: Clock,
              label: "Tin đã đóng",
              value: jobCounts?.closedJobs || 0,
              gradient: "from-[#649173]/80 to-[#dbd5a4]/80",
            },
            {
              icon: AlertTriangle,
              label: "Tin chờ duyệt",
              value: jobCounts?.pendingJobs || 0,
              gradient: "from-[#43cea2]/80 to-[#185a9d]/80",
            },
            {
              icon: Users,
              label: "Ứng viên đã ứng tuyển",
              value: companyProfile?.totalApplications || 0,
              gradient: "from-[#606c88]/80 to-[#3f4c6b]/80",
            },
            {
              icon: Calendar,
              label: "Ngày tạo tài khoản",
              value: companyProfile?.userAccount?.createDate
                ? new Date(
                    companyProfile.userAccount.createDate
                  ).toLocaleDateString("vi-VN")
                : "N/A",
              gradient: "from-[#fc96ce]/80 to-[#8f215c]/80",
            },
            {
              icon: StarRounded,
              label: "Đánh giá trung bình",
              value:
                reviews.length > 0
                  ? `${(
                      reviews.reduce(
                        (total, review) => total + review.star,
                        0
                      ) / reviews.length
                    ).toFixed(1)} (${reviews.length} đánh giá)`
                  : "0.0 (0 đánh giá)",
              gradient: "from-[#FF8C00]/80 to-[#FFA500]/80",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className={`p-3 custom-800:p-4 custom-1360:p-6 bg-gradient-to-r ${item.gradient} shadow-md`}
            >
              <div className="flex items-center gap-3 custom-1360:gap-4">
                <item.icon className="w-7 h-7 custom-1360:w-8 custom-1360:h-8 text-white flex-shrink-0" />
                <div>
                  <p className="text-[0.8125rem] custom-1360:text-sm text-white">
                    {item.label}
                  </p>
                  <h3
                    className={`text-lg custom-1360:text-xl font-bold text-white ${
                      item.label === "Ngày tạo tài khoản"
                        ? "text-sm custom-1360:text-base"
                        : ""
                    }`}
                  >
                    {item.value}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Thông Tin Chi Tiết */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-3 custom-800:p-4 custom-1360:p-6 bg-white shadow-md">
            <h2 className="text-base custom-1360:text-lg font-semibold mb-4">
              Thông tin cơ bản
            </h2>
            <div className="space-y-3 custom-1360:space-y-4">
              {[
                {
                  icon: Users2,
                  label: "Giới thiệu công ty",
                  value: companyProfile?.description || "Chưa cập nhật",
                },
                {
                  icon: MapPin,
                  label: "Địa chỉ",
                  value: companyProfile?.address || "Chưa cập nhật",
                },
                {
                  icon: Briefcase,
                  label: "Ngành nghề",
                  value:
                    companyProfile?.industry?.length > 0
                      ? companyProfile.industry
                          .map((ind) => ind.industryName)
                          .join(", ")
                      : "Chưa cập nhật",
                },
                {
                  icon: Phone,
                  label: "Liên hệ",
                  value: companyProfile?.contact || "Chưa cập nhật",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: companyProfile?.email || "Chưa cập nhật",
                },
                {
                  icon: Calendar,
                  label: "Ngày thành lập",
                  value: companyProfile?.establishedTime
                    ? new Date(
                        companyProfile.establishedTime
                      ).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật",
                },
                {
                  icon: Banknote,
                  label: "Mã số thuế",
                  value: companyProfile?.taxCode || "Chưa cập nhật",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 custom-1360:gap-4"
                >
                  <item.icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-[0.8125rem] custom-1360:text-sm text-gray-600">
                      {item.label}
                    </p>
                    <p className={`font-medium ${fontSize}`}>{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 custom-1360:gap-4">
                <Link className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-[0.8125rem] custom-1360:text-sm text-gray-600">
                    Liên kết xã hội
                  </p>
                  {socialLinks?.length > 0 ? (
                    socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 mt-1">
                        <div className="w-7 h-7 custom-1360:w-8 custom-1360:h-8 flex-shrink-0">
                          <img
                            src={require(`../../../assets/images/platforms/${link.platform.toLowerCase()}.png`)}
                            alt={link.platform?.toLowerCase() || "platform"}
                            className="h-full w-full object-contain rounded-full shadow-sm"
                          />
                        </div>
                        <a
                          href={link.url}
                          className={`text-purple-600 truncate ${fontSize}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ maxWidth: "calc(100% - 48px)" }}
                        >
                          {link.url}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className={`text-[0.8125rem] ${fontSize}`}>
                      Không có liên kết xã hội nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Thống Kê Tin Tuyển Dụng */}
        <Card className="p-3 custom-800:p-4 custom-1360:p-6 mt-6 bg-white shadow-md">
          <div className="flex flex-col custom-800:flex-row custom-800:items-center custom-800:justify-between gap-3 custom-1360:gap-4 mb-6">
            <h2 className="text-base custom-1360:text-lg font-semibold">
              Thống kê tin tuyển dụng
            </h2>
            <div className="flex flex-col custom-800:flex-row custom-800:items-center gap-3 custom-1360:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <input
                  type="date"
                  name="startDate"
                  value={chartDateRange.startDate}
                  onChange={handleChartDateChange}
                  className={`border-none focus:outline-none w-full custom-800:max-w-[140px] ${fontSize} p-1.5`}
                />
                <span className={fontSize}>-</span>
                <input
                  type="date"
                  name="endDate"
                  value={chartDateRange.endDate}
                  onChange={handleChartDateChange}
                  className={`border-none focus:outline-none w-full custom-800:max-w-[140px] ${fontSize} p-1.5`}
                />
              </div>
              <div className="flex gap-2">
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodFilter(period)}
                    className={`px-3 py-1.5 custom-1360:px-3 custom-1360:py-1 rounded transition-colors ${
                      activePeriod === period
                        ? "bg-purple-100 text-purple-600"
                        : "hover:bg-purple-100"
                    } ${fontSize} hover:shadow-lg`}
                  >
                    {period === "week"
                      ? "Tuần"
                      : period === "month"
                      ? "Tháng"
                      : "Năm"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {dateError && (
            <div
              className={`mb-4 p-3 custom-1360:p-4 bg-red-100 border border-red-200 rounded-md text-red-600 ${fontSize}`}
            >
              {dateError}
            </div>
          )}

          <div
            ref={chartRef}
            className="h-[200px] custom-800:h-[250px] custom-1360:h-[300px]"
          >
            {isChartLoading && <ChartSkeleton />}
            {error && !dateError && (
              <div
                className={`flex items-center justify-center h-full bg-red-100 text-red-600 ${fontSize} p-3 custom-1360:p-4 rounded-md`}
              >
                {error}
              </div>
            )}
            {!isChartLoading &&
              !error &&
              !dateError &&
              chartData.length === 0 && (
                <div
                  className={`flex items-center justify-center h-full text-gray-500 ${fontSize}`}
                >
                  Không có dữ liệu cho khoảng thời gian này
                </div>
              )}
            {!isChartLoading &&
              !error &&
              !dateError &&
              chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#666", fontSize: isMobile ? 10 : 12 }}
                      tickLine={{ stroke: "#666" }}
                      tickFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          return isNaN(date.getTime())
                            ? value
                            : date.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                              });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#666", fontSize: isMobile ? 10 : 12 }}
                      tickLine={{ stroke: "#666" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalJobs"
                      name="Tổng tin"
                      stroke="#818cf8"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeJobs"
                      name="Đang tuyển"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="closedJobs"
                      name="Đã đóng"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pendingJobs"
                      name="Chờ duyệt"
                      stroke="#facc15"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </Card>

        {/* Modal */}
        {open && (
          <BlockedCompanyModal
            open={open}
            handleClose={handleClose}
            companyId={companyId}
            className={`max-w-[95vw] custom-800:max-w-md custom-1360:max-w-lg text-sm custom-1360:text-base p-3 custom-1360:p-4`}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            companyName={companyProfile?.companyName}
          />
        )}
      </div>
    </div>
  );
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] custom-800:max-w-md custom-1360:max-w-lg p-3 custom-1360:p-4">
        <DialogHeader>
          <DialogTitle className="text-sm custom-1360:text-base">
            Xác nhận xóa công ty
          </DialogTitle>
          <DialogDescription className="text-sm custom-1360:text-base">
            Bạn có chắc chắn muốn xóa công ty "{companyName}"? Hành động này
            không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-[0.8125rem] custom-1360:text-sm px-3 py-1.5 custom-1360:px-4 custom-1360:py-2 hover:bg-purple-100 hover:shadow-lg"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="text-[0.8125rem] custom-1360:text-sm px-3 py-1.5 custom-1360:px-4 custom-1360:py-2 bg-red-600 hover:bg-red-700 hover:shadow-lg"
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
