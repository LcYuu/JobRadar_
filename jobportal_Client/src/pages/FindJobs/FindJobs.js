import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

import { Checkbox } from "../../ui/checkbox";
import JobList_AllJob from "../../components/common/JobList_AllJob/JobList_AllJob";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,

  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search, ChevronDown} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  countJobByType,
  fetchSalaryRange,
  getAllJobAction,
  searchJobs,
} from "../../redux/JobPost/jobPost.action";
// import Pagination from "../../components/layout/Pagination";
import { getCity } from "../../redux/City/city.action";
import { getIndustryCount } from "../../redux/Industry/industry.action";
import RangeSlider from "../../components/common/RangeSlider/RangeSlider";
import { useLocation } from "react-router-dom";

export default function JobSearchPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  const {
    searchJob = [],
    jobPost = [],
    totalPages: totalPagesFromSearch = 0,
    totalPages: totalPagesFromAll = 0,
    jobCountByType = [],
    loading,
    error,
    minSalary,
    maxSalary,
  } = useSelector((store) => store.jobPost);

  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(7);

  const [searchInput, setSearchInput] = useState(""); // State tạm thời để lưu input

  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);
  const [filters, setFilters] = useState({
    title: "",
    selectedTypesOfWork: [],
    cityId: "",
    selectedIndustryIds: [],
  });

  const isFilterApplied =
    filters.title ||
    filters.cityId ||
    filters.selectedTypesOfWork.length ||
    filters.selectedIndustryIds.length ||
    (filters.minSalary !== undefined && filters.minSalary !== null) ||
    (filters.maxSalary !== undefined && filters.maxSalary !== null);

  const location = useLocation();

  useEffect(() => {
    // Check if there are selected industry IDs in the state
    if (location.state?.selectedIndustryIds) {
      setFilters((prev) => ({
        ...prev,
        selectedIndustryIds: location.state.selectedIndustryIds,
      }));
    }
  }, [location]);

  useEffect(() => {
    if (isFilterApplied) {
      dispatch(searchJobs(filters, currentPage, size));
    } else {
      dispatch(getAllJobAction(currentPage, size));
    }
    console.log({
      totalJobs: isFilterApplied ? searchJob.length : jobPost.length,
      currentPage,
      size,
      results: isFilterApplied ? searchJob : jobPost,
      totalPages: isFilterApplied ? totalPagesFromSearch : totalPagesFromAll,
    });
  }, [filters, currentPage, dispatch]);

  useEffect(() => {
    // Lấy danh sách thành phố và loại công việc
    dispatch(getCity());
    dispatch(countJobByType());
    dispatch(getIndustryCount());
    dispatch(fetchSalaryRange());
  }, [dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (isFilterApplied) {
      setCurrentPage(0); // Đặt lại trang về 0 khi bộ lọc thay đổi
    }
  }, [filters]);

  const handleSalaryChange = (newValues) => {
    setFilters({
      ...filters,
      minSalary: newValues[0],
      maxSalary: newValues[1],
    });
  };
  console.log("Filters hiện tại:", currentPage);

  const results = isFilterApplied ? searchJob : jobPost;
  const totalPages = isFilterApplied ? totalPagesFromSearch : totalPagesFromAll;

  return (
    <div className="min-h-screen bg-transparent">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center my-8">
          Tìm kiếm{" "}
          <span className="relative inline-block text-primary text-blue-500">
            công việc trong mơ của bạn
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 opacity-50"></span>
          </span>
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập tên công việc hoặc từ khóa mong muốn"
                className="pl-10"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
            </div>
            <div className="relative w-64">
              <Select
                onValueChange={(value) => {
                  setFilters({ ...filters, cityId: value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {cities.map((c) => (
                      <SelectItem key={c.cityId} value={c.cityId}>
                        {c.cityName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="bg-primary bg-purple-600 text-white"
              onClick={() => {
                // Khi nhấn nút "Tìm kiếm", set lại giá trị của filters.title với giá trị từ input
                setFilters({ ...filters, title: searchInput });
                setCurrentPage(0); // Đặt lại trang hiện tại về 0
              }}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex space-x-8 mt-20">
          <aside className="w-80 space-y-6 bg-white p-6 rounded-lg shadow-lg">
            {/* Filter Section */}
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Loại công việc
                <ChevronDown size={20} className="text-gray-500" />
              </h3>
              <div className="space-y-2">
                {jobCountByType
                  .filter((job) => job.count > 0)
                  .map((job) => (
                    <div
                      className="flex items-center hover:bg-purple-100 p-2 rounded-lg"
                      key={job.typeOfWork}
                    >
                      <Checkbox
                        onCheckedChange={(checked) => {
                          const updatedTypesOfWork = checked
                            ? [...filters.selectedTypesOfWork, job.typeOfWork]
                            : filters.selectedTypesOfWork.filter(
                                (type) => type !== job.typeOfWork
                              );

                          setFilters({
                            ...filters,
                            selectedTypesOfWork: updatedTypesOfWork,
                          });
                        }}
                      />
                      <label className="ml-2 text-sm text-gray-700 tracking-tight">
                        {job.typeOfWork} ({job.count} việc làm)
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Industry Section */}
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Danh mục
                <ChevronDown size={20} className="text-gray-500" />
              </h3>
              <div className="space-y-2">
                {industryCount
                  .filter((industry) => industry.jobCount > 0)
                  .map((industry) => (
                    <div
                      className="flex items-center hover:bg-purple-100 p-2 rounded-lg"
                      key={industry.industryId}
                    >
                      <Checkbox
                        checked={filters.selectedIndustryIds.includes(
                          industry.industryId
                        )}
                        onCheckedChange={(checked) => {
                          const updatedIndustryIds = checked
                            ? [
                                ...filters.selectedIndustryIds,
                                industry.industryId,
                              ]
                            : filters.selectedIndustryIds.filter(
                                (id) => id !== industry.industryId
                              );

                          setFilters({
                            ...filters,
                            selectedIndustryIds: updatedIndustryIds,
                          });
                        }}
                      />
                      <label className="ml-2 text-sm text-gray-700 tracking-tight">
                        {industry.industryName} ({industry.jobCount} việc làm)
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Salary Range Filter */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-800 tracking-tight">
                Bộ lọc theo mức lương
              </h3>
              <RangeSlider
                min={minSalary}
                max={maxSalary}
                onChange={handleSalaryChange}
                className="w-full"
              />
            </div>

            {/* Banner Section */}
            <div className="mt-10">
              <img
                src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/img/Banner%202%20(1).png" // Thay đổi đường dẫn ảnh ở đây
                alt="Banner"
                className="w-full h-auto rounded-lg shadow-md transition-transform transform hover:scale-105"
              />
            </div>
          </aside>

          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Tất cả công việc</h2>
                <span className="text-sm font-bold text-gray-500">
                  Tổng số: {isFilterApplied ? searchJob.length : jobPost.length}{" "}
                  kết quả
                </span>
              </div>

              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sắp xếp theo:</span>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tiêu chí sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sắp xếp theo</SelectLabel>
                      <SelectItem value="Most relevant">
                        Liên quan nhất
                      </SelectItem>
                      <SelectItem value="Newest">Mới nhất</SelectItem>
                      <SelectItem value="Oldest">Cũ nhất</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <div className="flex border rounded">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-r-none"
                  >
                    <Grid size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-l-none bg-gray-100"
                  >
                    <List size={20} />
                  </Button>
                </div>
              </div> */}
            </div>

            {results.length === 0 && isFilterApplied ? (
              <div className="text-center text-gray-500">
                Không có kết quả nào phù hợp với tìm kiếm của bạn.
              </div>
            ) : (
              <JobList_AllJob
                jobs={results}
                currentPage={currentPage}
                size={size}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
