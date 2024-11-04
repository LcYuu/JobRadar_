import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import JobList_AllJob from "../../components/common/JobList_AllJob/JobList_AllJob";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search, MapPin, ChevronDown, Grid, List } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  countJobByType,
  fetchSalaryRange,
  getAllJobAction,
  searchJobs,
} from "../../redux/JobPost/jobPost.action";
import Pagination from "../../components/layout/Pagination";
import { getCity } from "../../redux/City/city.action";
import { getIndustryCount } from "../../redux/Industry/industry.action";
import RangeSlider from "../../components/common/RangeSlider/RangeSlider";

export default function JobSearchPage() {
  const dispatch = useDispatch();
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


  useEffect(() => {
    if (isFilterApplied) {
      dispatch(searchJobs(filters, currentPage, size));
    } else {
      dispatch(getAllJobAction(currentPage, size));
    }
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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Tìm kiếm{" "}
          <span className="text-primary">công việc trong mơ của bạn</span>
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập tên công việc hoặc từ khóa mong muốn"
                className="pl-10"
                value={filters.title}
                onChange={(e) => {
                  setFilters({ ...filters, title: e.target.value });
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
                setCurrentPage(0); // Đặt lại trang hiện tại về 0
              }}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex space-x-8 mt-52">
          <aside className="w-64 space-y-6">
            {/* Filter Section */}
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Loại công việc
                <ChevronDown size={20} />
              </h3>
              <div className="space-y-2">
                {jobCountByType.map((job) => (
                  <div className="flex items-center" key={job.typeOfWork}>
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
                    <label className="ml-2 text-sm">
                      {job.typeOfWork} ({job.count})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Danh mục
                <ChevronDown size={20} />
              </h3>
              <div className="space-y-2">
                {industryCount.map((industry) => (
                  <div className="flex items-center" key={industry.industryId}>
                    <Checkbox
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
                    <label className="ml-2 text-sm">
                      {industry.industryName} ({industry.jobCount})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="font-semibold mb-2 flex justify-between items-center">
              Bộ lọc theo mức lương
            </h3>
            <RangeSlider
              min={minSalary}
              max={maxSalary}
              onChange={handleSalaryChange} // Truyền hàm để cập nhật mức lương
            />
          </aside>

          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">Tất cả công việc</h2>
                <span className="text-sm text-gray-500">
                  Hiển thị {results.length} kết quả
                </span>
              </div>
              <div className="flex items-center space-x-2">
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
              </div>
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
