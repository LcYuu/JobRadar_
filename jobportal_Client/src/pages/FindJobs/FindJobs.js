
import { useEffect, useState, useCallback } from "react";
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
import { Search, ChevronDown, Sparkles, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// import Pagination from "../../components/layout/Pagination";

import RangeSlider from "../../components/common/RangeSlider/RangeSlider";
import { useLocation } from "react-router-dom";
import { countJobByType, fetchSalaryRange, getAllJobAction, searchJobs, semanticSearchJobsWithGemini } from "../../redux/JobPost/jobPost.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { getIndustryCount } from "../../redux/Industry/industry.thunk";
import { toast } from "react-toastify";
import useWebSocket from "../../utils/useWebSocket";

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
    minSalary,
    maxSalary,
  } = useSelector((store) => store.jobPost);

  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(7);

  const [searchInput, setSearchInput] = useState(""); // State tạm thời để lưu input
  const [lastSearchQuery, setLastSearchQuery] = useState(""); // Lưu từ khóa tìm kiếm cuối cùng

  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);
  const [filters, setFilters] = useState({
    title: "",
    selectedTypesOfWork: [],
    cityId: "",
    selectedIndustryIds: [],
  });


  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState(null);
  const [isUsingSemanticSearch, setIsUsingSemanticSearch] = useState(false);
  const [semanticSearchCache, setSemanticSearchCache] = useState({}); // Cache kết quả tìm kiếm ngữ nghĩa

  const [allResults, setAllResults] = useState(null); // Lưu trữ toàn bộ kết quả từ API
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

  // Hàm để lấy kết quả tìm kiếm thông thường
  const fetchRegularSearchResults = useCallback(() => {
    if (isFilterApplied) {
      dispatch(searchJobs({ filters, currentPage, size }));
    } else {
      dispatch(getAllJobAction({ currentPage, size }));
    }
  }, [dispatch, filters, currentPage, size, isFilterApplied]);

  useEffect(() => {
    // Chỉ gọi tìm kiếm thông thường nếu không đang sử dụng tìm kiếm ngữ nghĩa
    if (!isUsingSemanticSearch) {
      fetchRegularSearchResults();
    }
  }, [fetchRegularSearchResults, isUsingSemanticSearch]);

  useEffect(() => {
    // Lấy danh sách thành phố và loại công việc
    dispatch(getCity());
    dispatch(countJobByType());
    dispatch(getIndustryCount());
    dispatch(fetchSalaryRange());
  }, [dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Nếu đang sử dụng tìm kiếm ngữ nghĩa và có allResults, không cần gọi API
    if (isUsingSemanticSearch && allResults) {
      // Phân trang sẽ được xử lý bởi getDisplayResults
      return;
    }
    
    // Nếu không phải tìm kiếm ngữ nghĩa, gọi API với trang mới
    if (isFilterApplied) {
      dispatch(searchJobs({ filters, page, size }));
    } else {
      dispatch(getAllJobAction({ page, size }));
    }
  };

  useEffect(() => {
    if (isFilterApplied) {
      setCurrentPage(0); // Đặt lại trang về 0 khi bộ lọc thay đổi
    }
  }, [filters]);

  const handleSalaryChange = (newValues) => {
    handleFilterChange({
      ...filters,
      minSalary: newValues[0],
      maxSalary: newValues[1],
    });
  };

  // Hàm để tạo cache key từ query và filters
  const createCacheKey = (query, filters) => {
    return `${query}-${JSON.stringify(filters)}`;
  };

  // Hàm để lọc kết quả tìm kiếm ngữ nghĩa dựa trên filters hiện tại
  const filterSemanticResults = useCallback((results) => {
    if (!results || !results.content) return [];
    
    // Không cần lọc thủ công, API đã xử lý bộ lọc
    return results.content; 
  }, []);

  // Hàm để áp dụng phân trang cho kết quả đã lọc
  const paginateResults = useCallback((filteredResults, page, pageSize) => {
    // Không cần phân trang thủ công, API đã xử lý phân trang
    return filteredResults;
  }, []);

  // Theo dõi thay đổi của bộ lọc và tự động áp dụng khi đang sử dụng tìm kiếm ngữ nghĩa
  useEffect(() => {
    // Nếu đang sử dụng tìm kiếm ngữ nghĩa và có từ khóa tìm kiếm
    if (isUsingSemanticSearch && searchInput.trim() && allResults) {
      console.log("Bộ lọc thay đổi, lọc kết quả trên client");
      
      // Tạo cache key mới
      const cacheKey = `${searchInput}-${JSON.stringify(filters)}`;
      
      // Kiểm tra cache
      const cachedResults = semanticSearchCache[cacheKey];
      
      if (cachedResults) {
        console.log("Sử dụng kết quả từ cache");
        setSemanticResults(cachedResults);
        setCurrentPage(0);
        return;
      }
      
      // Lọc kết quả từ dữ liệu đã có
      const filteredResults = filterResultsLocally(allResults.content, filters);
      
      // Tạo kết quả mới
      const newResults = {
        ...allResults,
        content: filteredResults,
        totalElements: filteredResults.length
      };
      
      // Lưu vào cache
      setSemanticSearchCache(prev => ({
        ...prev,
        [cacheKey]: newResults
      }));
      
      // Cập nhật state
      setSemanticResults(newResults);
      setCurrentPage(0);
    }
  }, [filters, isUsingSemanticSearch, searchInput, allResults]);

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    console.log("Bộ lọc thay đổi:", newFilters);
    setFilters(newFilters);
    
    // Nếu không đang sử dụng tìm kiếm ngữ nghĩa, áp dụng bộ lọc ngay lập tức
    if (!isUsingSemanticSearch) {
      if (Object.values(newFilters).some(value => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
      })) {
        console.log("Áp dụng bộ lọc ngay lập tức");
        dispatch(searchJobs({ filters: newFilters, page: 0, size }));
      } else {
        console.log("Không có bộ lọc, lấy tất cả công việc");
        dispatch(getAllJobAction({ page: 0, size }));
      }
    }
  };

  // Hàm để lọc kết quả trên client
  const filterResultsLocally = (results, filters) => {
    if (!results) return [];
    
    return results.filter(job => {
      // Lọc theo loại công việc
      if (filters.selectedTypesOfWork.length > 0 && 
          !filters.selectedTypesOfWork.includes(job.typeOfWork)) {
        return false;
      }
      
      // Lọc theo thành phố
      if (filters.cityId && job.city?.cityId !== filters.cityId) {
        return false;
      }
      
      // Lọc theo ngành nghề
      if (filters.selectedIndustryIds.length > 0 && 
          !filters.selectedIndustryIds.includes(job.industry?.industryId)) {
        return false;
      }
      
      // Lọc theo mức lương
      if (filters.minSalary !== undefined && filters.minSalary !== null && 
          job.salary < filters.minSalary) {
        return false;
      }
      
      if (filters.maxSalary !== undefined && filters.maxSalary !== null && 
          job.salary > filters.maxSalary) {
        return false;
      }
      
      return true;
    });
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      return;
    }

    try {
      // Gọi API semantic search với endpoint mới
      console.log("Gọi API semantic search với query:", searchInput);
      
      const result = await dispatch(semanticSearchJobsWithGemini({
        query: searchInput,
        filters: {}, // Gọi API không có filter để lấy tất cả kết quả
        currentPage: 0,
        size: 100 // Lấy nhiều kết quả hơn để xử lý lọc trên client
      })).unwrap();

      // Lưu lại toàn bộ kết quả để xử lý lọc
      setAllResults(result);
      
      // Lọc kết quả dựa trên bộ lọc hiện tại
      const filteredResults = filterResultsLocally(result.content, filters);
      
      // Tạo kết quả mới đã lọc
      const filteredResult = {
        ...result,
        content: filteredResults,
        totalElements: filteredResults.length
      };
      
      // Lưu vào cache
      const cacheKey = `${searchInput}-${JSON.stringify(filters)}`;
      setSemanticSearchCache(prev => ({
        ...prev,
        [cacheKey]: filteredResult
      }));
      
      // Cập nhật state
      setSemanticResults(filteredResult);
      setIsUsingSemanticSearch(true);
      setCurrentPage(0);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm ngữ nghĩa:", error);
      // Nếu có lỗi, chuyển về tìm kiếm thông thường
      setIsUsingSemanticSearch(false);
      setSemanticResults(null);
      // Áp dụng bộ lọc title
      const newFilters = { ...filters, title: searchInput };
      dispatch(searchJobs({ filters: newFilters, page: 0, size }));
    }
  };

  // Hàm để xóa tìm kiếm ngữ nghĩa và quay lại tìm kiếm thông thường
  const clearSemanticSearch = () => {
    // Reset các state liên quan đến tìm kiếm ngữ nghĩa
    setIsUsingSemanticSearch(false);
    setSemanticResults(null);
    setAllResults(null); // Xóa kết quả gốc đã lưu
    setSearchInput("");
    setCurrentPage(0);
    
    // Xóa cache liên quan đến tìm kiếm ngữ nghĩa
    setSemanticSearchCache({});
    
    // Kiểm tra xem có bộ lọc nào đang được áp dụng không
    const hasActiveFilters = Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    });
    
    // Nếu có bộ lọc, sử dụng searchJobs
    if (hasActiveFilters) {
      console.log("Có bộ lọc đang áp dụng, sử dụng searchJobs");
      dispatch(searchJobs({ filters, page: 0, size }));
    } else {
      // Nếu không có bộ lọc, lấy tất cả công việc
      console.log("Không có bộ lọc, lấy tất cả công việc");
      dispatch(getAllJobAction({ page: 0, size }));
    }
  };

  // Hàm xử lý phân trang cho kết quả đã lọc trên client
  const paginateResultsLocally = (filteredResults, page, pageSize) => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredResults.slice(start, end);
  };

  // Xử lý kết quả hiển thị dựa trên loại tìm kiếm
  const getDisplayResults = () => {
    // Nếu đang sử dụng tìm kiếm ngữ nghĩa và có kết quả
    if (isUsingSemanticSearch && semanticResults) {
      console.log("Sử dụng kết quả từ tìm kiếm ngữ nghĩa:", semanticResults);
      
      // Phân trang kết quả nếu có allResults
      if (allResults) {
        const filteredResults = filterResultsLocally(allResults.content, filters);
        const paginatedResults = paginateResultsLocally(filteredResults, currentPage, size);
        
        return {
          content: paginatedResults,
          totalElements: filteredResults.length,
          totalPages: Math.ceil(filteredResults.length / size)
        };
      }
      
      return {
        content: semanticResults.content,
        totalElements: semanticResults.totalElements,
        totalPages: semanticResults.totalPages
      };
    }

    // Nếu có bộ lọc, sử dụng kết quả từ searchJobs
    if (isFilterApplied) {
      console.log("Sử dụng kết quả từ searchJobs với bộ lọc");
      return {
        content: searchJob,
        totalElements: searchJob.length,
        totalPages: totalPagesFromSearch
      };
    }

    // Nếu không có bộ lọc, sử dụng tất cả công việc
    console.log("Sử dụng tất cả công việc");
    return {
      content: jobPost,
      totalElements: jobPost.length,
      totalPages: totalPagesFromAll
    };
  };

  const displayResults = getDisplayResults();
  const results = displayResults.content;
  const totalPages = displayResults.totalPages;
  const totalResults = displayResults.totalElements;

  const handleMessage = useCallback(
    (dispatch, _, topic) => {
      if (topic === "/topic/job-updates") {
        dispatch(countJobByType());
        dispatch(getIndustryCount());
        dispatch(fetchSalaryRange());
        dispatch(searchJobs({ filters, currentPage, size }));
        dispatch(getAllJobAction({ currentPage, size }));
      }
      else if(topic === "/topic/industry-updates"){
        dispatch(getIndustryCount());
      }
    },[]
  );

  useWebSocket(["/topic/job-updates", "/topic/industry-updates"], (dispatch, message, topic) =>
    handleMessage(dispatch, message, topic)
  )(dispatch);

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
          <div className="flex flex-col gap-2">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="relative w-64">
                <Select
                  onValueChange={(value) => {
                    const newFilters = { ...filters, cityId: value };
                    handleFilterChange(newFilters);
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
                className={`${isUsingSemanticSearch ? 'bg-green-600 hover:bg-green-700' : 'bg-primary bg-purple-600 hover:bg-purple-700'} text-white`}
                onClick={handleSearch}
                  disabled={isSemanticSearching || !searchInput.trim()}
                >
                  {isSemanticSearching ? (
                    <>
                      <span className="mr-2">Đang tìm...</span>
                      <span className="animate-spin">⟳</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Tìm kiếm</span>
                    {isUsingSemanticSearch && <Sparkles size={16} className="ml-1" />}
                    </>
                  )}
                </Button>
            </div>
            
            <div className="flex items-center justify-end mt-2">
              {isUsingSemanticSearch && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={clearSemanticSearch}
                >
                  <X size={14} className="mr-1" />
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
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

                          handleFilterChange({
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

                          handleFilterChange({
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
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Mức lương
                <ChevronDown size={20} className="text-gray-500" />
              </h3>
              <div className="px-2">
              <RangeSlider
                  min={minSalary || 0}
                  max={maxSalary || 50000000}
                  step={1000000}
                onChange={handleSalaryChange}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>
                    {minSalary
                      ? `${(minSalary / 1000000).toFixed(0)}M`
                      : "0M"}{" "}
                    VNĐ
                  </span>
                  <span>
                    {maxSalary
                      ? `${(maxSalary / 1000000).toFixed(0)}M`
                      : "50M"}{" "}
                    VNĐ
                  </span>
                </div>
            </div>
            </div>
          </aside>

          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Tất cả công việc</h2>
                <span className="text-sm font-bold text-gray-500">
                  Tổng số: {totalResults} kết quả
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

            {results.length === 0 ? (
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
