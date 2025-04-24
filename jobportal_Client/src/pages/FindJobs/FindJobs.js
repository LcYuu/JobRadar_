import { useCallback, useEffect, useState } from "react";
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
import { Search, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import RangeSlider from "../../components/common/RangeSlider/RangeSlider";
import { useLocation } from "react-router-dom";
import {
  countJobByType,
  fetchSalaryRange,
  getAllJobAction,
  searchJobs,
} from "../../redux/JobPost/jobPost.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { getIndustryCount } from "../../redux/Industry/industry.thunk";
import useWebSocket from "../../utils/useWebSocket";

export default function JobSearchPage() {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux state
  const {
    searchJob = [],
    jobPost = [],
    totalPages: totalPagesFromSearch = 0,
    totalPages: totalPagesFromAll = 0,
    jobCountByType = [],
    minSalary,
    maxSalary,
  } = useSelector((store) => store.jobPost);
  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);

  // Local state
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    title: "",
    selectedTypesOfWork: [],
    cityId: "",
    selectedIndustryIds: [],
    minSalary: null,
    maxSalary: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Determine if filters are applied
  const isFilterApplied = Object.values(filters).some(
    (value) =>
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === "string" && value !== "") ||
      (typeof value === "number" && value !== null)
  );

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle industry IDs from location state
  useEffect(() => {
    if (location.state?.selectedIndustryIds) {
      setFilters((prev) => ({
        ...prev,
        selectedIndustryIds: location.state.selectedIndustryIds,
      }));
    }
  }, [location]);

  // Fetch initial data
  useEffect(() => {
    dispatch(getCity());
    dispatch(countJobByType());
    dispatch(getIndustryCount());
    dispatch(fetchSalaryRange());
  }, [dispatch]);

  // Fetch jobs based on filters or all jobs
  useEffect(() => {
    setIsLoading(true);
    if (isFilterApplied) {
      dispatch(searchJobs({ filters, currentPage, size })).finally(() =>
        setIsLoading(false)
      );
    } else {
      dispatch(getAllJobAction({ currentPage, size })).finally(() =>
        setIsLoading(false)
      );
    }
  }, [dispatch, filters, currentPage, size, isFilterApplied]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // WebSocket handler
  const handleMessage = useCallback(
    (dispatch, _, topic) => {
      if (topic === "/topic/job-updates") {
        dispatch(countJobByType());
        dispatch(getIndustryCount());
        dispatch(fetchSalaryRange());
        if (isFilterApplied) {
          dispatch(searchJobs({ filters, currentPage, size }));
        } else {
          dispatch(getAllJobAction({ currentPage, size }));
        }
      } else if (topic === "/topic/industry-updates") {
        dispatch(getIndustryCount());
      }
    },
    [dispatch, filters, currentPage, size, isFilterApplied]
  );

  useWebSocket(
    ["/topic/job-updates", "/topic/industry-updates"],
    handleMessage
  )(dispatch);

  // Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSalaryChange = (newValues) => {
    setFilters({
      ...filters,
      minSalary: newValues[0],
      maxSalary: newValues[1],
    });
  };

  const handleSearch = () => {
    setFilters({ ...filters, title: searchInput });
    setCurrentPage(0);
  };

  // Determine results and total pages
  const results = isFilterApplied ? searchJob : jobPost;
  const totalPages = isFilterApplied ? totalPagesFromSearch : totalPagesFromAll;

  return (
    <div className="min-h-screen bg-transparent">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center my-8">
          Tìm kiếm{" "}
          <span className="relative inline-block text-blue-500">
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
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="relative w-64">
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, cityId: value })
                }
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
              className="bg-purple-600 text-white"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex space-x-8 mt-8">
          <aside className="w-80 space-y-6 bg-white p-6 rounded-lg shadow-lg">
            {/* Job Type Filter */}
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
                        checked={filters.selectedTypesOfWork.includes(
                          job.typeOfWork
                        )}
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

            {/* Industry Filter */}
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
                Bộ lọc theo mức lương (đơn vị: VND)
              </h3>
              <RangeSlider
                min={minSalary}
                max={maxSalary}
                onChange={handleSalaryChange}
                className="w-full"
              />
            </div>

            {/* Banner */}
            <div className="mt-10">
              <img
                src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/img/Banner%202%20(1).png"
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
                  Tổng số: {results.length} kết quả
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-gray-500">Đang tải...</div>
            ) : results.length === 0 && isFilterApplied ? (
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