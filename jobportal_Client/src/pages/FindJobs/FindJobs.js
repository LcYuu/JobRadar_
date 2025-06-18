import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { Search, ChevronDown, Sparkles, X, Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../components/common/Pagination/Pagination";
import RangeSlider from "../../components/common/RangeSlider/RangeSlider";
import { useLocation, useNavigate } from "react-router-dom";
import {
  countJobByType,
  fetchSalaryRange,
  getAllJobAction,
  searchJobs,
  semanticSearchJobsWithGemini,
  getAllJobs,
} from "../../redux/JobPost/jobPost.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { getIndustryCount } from "../../redux/Industry/industry.thunk";
import { toast } from "react-toastify";
import useWebSocket from "../../utils/useWebSocket";
import { ProgressBar } from "../../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { debounce } from "lodash";

export default function JobSearchPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Redux state
  const {
    searchJob = [],
    jobPost = [],
    totalPages: totalPagesFromSearch = 0,
    totalPages: totalPagesFromAll = 0,
    totalElements = 0,
    jobCountByType = [],
    minSalary,
    maxSalary,
  } = useSelector((store) => store.jobPost);

  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);

  // Refs to prevent unnecessary effects
  const isInitialMount = useRef(true);
  const lastDispatchedFilters = useRef(null);

  // Core state
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10); // Make size constant to prevent unnecessary updates
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search related state
  const [searchInput, setSearchInput] = useState(() => {
    return sessionStorage.getItem("searchInput") || "";
  });

  // Filters state with optimized initialization
  const [filters, setFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem("searchFilters");
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error("Lỗi khi parse filters từ sessionStorage:", e);
      }
    }
    return {
      title: "",
      selectedTypesOfWork: [],
      cityId: "",
      selectedIndustryIds: [],
    };
  });

  // Semantic search state
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState(() => {
    const savedResults = sessionStorage.getItem("semanticResults");
    if (savedResults) {
      try {
        return JSON.parse(savedResults);
      } catch (e) {
        console.error("Lỗi khi parse kết quả tìm kiếm từ sessionStorage:", e);
      }
    }
    return null;
  });
  const [isUsingSemanticSearch, setIsUsingSemanticSearch] = useState(() => {
    return sessionStorage.getItem("isUsingSemanticSearch") === "true";
  });
  const [allResults, setAllResults] = useState(() => {
    const savedAllResults = sessionStorage.getItem("allResults");
    if (savedAllResults) {
      try {
        return JSON.parse(savedAllResults);
      } catch (e) {
        console.error("Lỗi khi parse allResults từ sessionStorage:", e);
      }
    }
    return null;
  });

  // Loading and UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isSalaryOpen, setIsSalaryOpen] = useState(true);

  // Memoized values
  const isFilterApplied = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters]);

  const displayTotalElements = useMemo(() => {
    if (isUsingSemanticSearch && semanticResults) {
      return semanticResults.totalElements || 0;
    } else if (isFilterApplied) {
      return totalElements;
    } else {
      return jobPost.length;
    }
  }, [isUsingSemanticSearch, semanticResults, isFilterApplied, totalElements, jobPost.length]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Initialize data on mount
  useEffect(() => {
    if (isInitialMount.current) {
      // Set location state filters if provided
      if (location.state?.selectedIndustryIds) {
        setFilters((prev) => ({
          ...prev,
          selectedIndustryIds: location.state.selectedIndustryIds,
        }));
      }

      // Fetch initial data
      dispatch(getCity());
      dispatch(countJobByType());
      dispatch(getIndustryCount());
      dispatch(fetchSalaryRange());

      isInitialMount.current = false;
    }
  }, [dispatch, location.state]);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    debounce((newFilters) => {
      const filtersString = JSON.stringify(newFilters);
      const lastFiltersString = JSON.stringify(lastDispatchedFilters.current);
      
      // Avoid dispatching if filters haven't actually changed
      if (filtersString === lastFiltersString) {
        return;
      }

      lastDispatchedFilters.current = newFilters;
      setCurrentPage(0);

      if (isUsingSemanticSearch && allResults) {
        const filteredResults = filterResultsLocally(allResults.content, newFilters);
        setSemanticResults({
          ...allResults,
          content: filteredResults,
          totalElements: filteredResults.length,
          totalPages: Math.ceil(filteredResults.length / size)
        });
      } else {
        const hasActiveFilters = Object.values(newFilters).some(value => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null && value !== '';
        });

        if (hasActiveFilters) {
          dispatch(searchJobs({ filters: newFilters, page: 0, size }));
        } else {
          dispatch(getAllJobAction({ page: 0, size }));
        }
      }
    }, 300),
    [dispatch, size, isUsingSemanticSearch, allResults]
  );

  // Optimized filter change handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    debouncedFilterChange(newFilters);
  }, [debouncedFilterChange]);

  // Save to sessionStorage when needed
  useEffect(() => {
    sessionStorage.setItem("searchInput", searchInput);
  }, [searchInput]);

  useEffect(() => {
    sessionStorage.setItem("searchFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (semanticResults) {
      sessionStorage.setItem("semanticResults", JSON.stringify(semanticResults));
    }
  }, [semanticResults]);

  useEffect(() => {
    sessionStorage.setItem("isUsingSemanticSearch", isUsingSemanticSearch);
  }, [isUsingSemanticSearch]);

  useEffect(() => {
    if (allResults) {
      sessionStorage.setItem("allResults", JSON.stringify(allResults));
    }
  }, [allResults]);

  // Optimized data fetching effect
  useEffect(() => {
    if (isInitialMount.current || isUsingSemanticSearch) return;

    setIsLoading(true);
    const fetchData = async () => {
      try {
        if (isFilterApplied) {
          await dispatch(searchJobs({ filters, currentPage, size })).unwrap();
        } else {
          await dispatch(getAllJobAction({ currentPage, size })).unwrap();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, currentPage, size, isFilterApplied, isUsingSemanticSearch]);

  const extractIndustryId = useCallback((job) => {
    if (job.industry?.industryId) return job.industry.industryId;
    if (job.industryId) return job.industryId;
    if (job.industry?.id) return job.industry.id;
    if (job.industry_id) return job.industry_id;
    if (job.industryDTO?.industryId) return job.industryDTO.industryId;
    if (job.industryDTO?.id) return job.industryDTO.id;
    if (job.jobPost?.industry?.industryId) return job.jobPost.industry.industryId;
    if (job.jobPost?.industry?.id) return job.jobPost.industry.id;
    if (job.jobPost?.industryId) return job.jobPost.industryId;
    if (typeof job.industry === "string") return job.industry;

    const findIndustryIdRecursive = (obj, depth = 0) => {
      if (!obj || typeof obj !== "object" || depth > 3) return null;
      for (const key in obj) {
        if (
          (key === "industryId" ||
            key === "industry_id" ||
            (key === "id" && (obj.name || obj.industryName))) &&
          (typeof obj[key] === "string" || typeof obj[key] === "number")
        ) {
          return obj[key];
        }
        if (key === "industry" && obj[key] && typeof obj[key] === "object") {
          const industryObj = obj[key];
          if (industryObj.industryId) return industryObj.industryId;
          if (industryObj.id) return industryObj.id;
        }
      }
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object") {
          const result = findIndustryIdRecursive(obj[key], depth + 1);
          if (result) return result;
        }
      }
      return null;
    };
    return findIndustryIdRecursive(job);
  }, []);

  const filterResultsLocally = useCallback(
    (jobs, currentFilters) => {
      if (!jobs) return [];
      return jobs.filter((job) => {
        if (
          currentFilters.selectedTypesOfWork &&
          currentFilters.selectedTypesOfWork.length > 0
        ) {
          const jobType =
            typeof job.typeOfWork === "string"
              ? job.typeOfWork
              : job.typesOfWork?.name ||
                job.typeOfWork?.name ||
                job.typeOfJobWork ||
                null;
          if (
            !jobType ||
            !currentFilters.selectedTypesOfWork.includes(jobType)
          ) {
            return false;
          }
        }
        if (currentFilters.cityId) {
          const jobCityId = job.city?.cityId || job.cityId;
          if (!jobCityId || jobCityId !== currentFilters.cityId) {
            return false;
          }
        }
        if (
          currentFilters.selectedIndustryIds &&
          currentFilters.selectedIndustryIds.length > 0
        ) {
          let jobIndustryId = extractIndustryId(job);
          if (jobIndustryId !== null && jobIndustryId !== undefined) {
            jobIndustryId = String(jobIndustryId);
          }
          const selectedIndustryIdsAsString =
            currentFilters.selectedIndustryIds.map((id) => String(id));
          if (
            !jobIndustryId ||
            !selectedIndustryIdsAsString.includes(jobIndustryId)
          ) {
            return false;
          }
        }
        if (
          currentFilters.minSalary !== undefined &&
          currentFilters.minSalary !== null
        ) {
          const jobSalary = job.salary || 0;
          if (jobSalary < currentFilters.minSalary) {
            return false;
          }
        }
        if (
          currentFilters.maxSalary !== undefined &&
          currentFilters.maxSalary !== null
        ) {
          const jobSalary = job.salary || 0;
          if (jobSalary > currentFilters.maxSalary) {
            return false;
          }
        }
        return true;
      });
    },
    [extractIndustryId]
  );

  const handleSearch = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      toast.info("Vui lòng đăng nhập để sử dụng tính năng tìm kiếm", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (!searchInput.trim()) {
      return;
    }
    try {
      setHasUserInteracted(true);
      setIsSearching(true);
      setSearchProgress(5);
      
      const searchPhases = [
        { progress: 20, delay: 300 },
        { progress: 40, delay: 800 },
        { progress: 65, delay: 1300 },
        { progress: 85, delay: 1800 },
      ];
      
      searchPhases.forEach((phase) => {
        setTimeout(() => {
          if (isSearching) {
            setSearchProgress(phase.progress);
          }
        }, phase.delay);
      });

      const result = await dispatch(
        semanticSearchJobsWithGemini({
          query: searchInput,
          filters: {},
          currentPage: 0,
          size: 100,
        })
      ).unwrap();
      
      setSearchProgress(100);
      
      if (!result || !result.content || !Array.isArray(result.content)) {
        console.error("Kết quả tìm kiếm ngữ nghĩa không hợp lệ:", result);
        throw new Error("Kết quả tìm kiếm không hợp lệ");
      }

      setAllResults(result);
      const filteredResults = filterResultsLocally(result.content, filters);
      const filteredResult = {
        ...result,
        content: filteredResults,
        totalElements: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / size),
      };

      setSemanticResults(filteredResult);
      setIsUsingSemanticSearch(true);
      setCurrentPage(0);
      sessionStorage.setItem("lastSearchQuery", searchInput);

      toast.success(
        `Đã tìm thấy ${filteredResults.length} công việc phù hợp với bạn!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm ngữ nghĩa:", error);
      toast.error(
        "Có lỗi khi tìm kiếm. Đang chuyển sang tìm kiếm thông thường."
      );
      setIsUsingSemanticSearch(false);
      setSemanticResults(null);
      const newFilters = { ...filters, title: searchInput };
      dispatch(searchJobs({ filters: newFilters, page: 0, size }));
      setIsSearching(false);
      sessionStorage.setItem("isUsingSemanticSearch", "false");
      sessionStorage.removeItem("semanticResults");
      sessionStorage.removeItem("allResults");
    }
  };

  const clearSemanticSearch = useCallback(() => {
    setIsUsingSemanticSearch(false);
    setSemanticResults(null);
    setAllResults(null);
    setSearchInput("");
    setCurrentPage(0);
    sessionStorage.removeItem("searchInput");
    sessionStorage.removeItem("semanticResults");
    sessionStorage.removeItem("allResults");
    sessionStorage.setItem("isUsingSemanticSearch", "false");
    
    const hasActiveFilters = Object.values(filters).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    });
    
    if (hasActiveFilters) {
      dispatch(searchJobs({ filters, page: 0, size }));
    } else {
      dispatch(getAllJobAction({ page: 0, size }));
    }
  }, [filters, size, dispatch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (isUsingSemanticSearch && semanticResults) {
      sessionStorage.setItem("currentPage", page.toString());
      return;
    }
    if (isFilterApplied) {
      dispatch(searchJobs({ filters, page, size }));
    } else {
      dispatch(getAllJobAction({ page, size }));
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isUsingSemanticSearch, semanticResults, isFilterApplied, filters, size, dispatch]);

  const handleSalaryChange = useCallback((newValues) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      toast.info("Vui lòng đăng nhập để lọc theo mức lương", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    const newFilters = {
      ...filters,
      minSalary: newValues[0],
      maxSalary: newValues[1],
    };
    handleFilterChange(newFilters);
  }, [isAuthenticated, filters, handleFilterChange]);

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
      }
    },
    [filters, currentPage, size, isFilterApplied]
  );

  useWebSocket(
    ["/topic/job-updates", "/topic/industry-updates"],
    handleMessage
  )(dispatch);

  // Get display results
  const getDisplayResults = useCallback(() => {
    try {
      if (isUsingSemanticSearch && semanticResults) {
        if (!semanticResults.content || !Array.isArray(semanticResults.content)) {
          return { content: [], totalElements: 0, totalPages: 1 };
        }
        const resultsArray = semanticResults.content;
        const totalResults = resultsArray.length || 0;
        const totalPages = Math.max(Math.ceil(totalResults / size) || 1, 1);
        const startIndex = currentPage * size;
        const endIndex = Math.min(startIndex + size, totalResults);
        const paginatedContent = totalResults > 0 ? resultsArray.slice(startIndex, endIndex) : [];
        
        return {
          content: paginatedContent,
          totalElements: totalResults,
          totalPages: totalPages,
        };
      }

      if (isFilterApplied) {
        return {
          content: searchJob || [],
          totalElements: totalElements,
          totalPages: totalPagesFromSearch || 1,
        };
      }

      return {
        content: jobPost || [],
        totalElements: jobPost.length,
        totalPages: totalPagesFromAll || 1,
      };
    } catch (error) {
      console.error("Error in getDisplayResults:", error);
      return { content: [], totalElements: 0, totalPages: 1 };
    }
  }, [
    isUsingSemanticSearch,
    semanticResults,
    isFilterApplied,
    searchJob,
    jobPost,
    currentPage,
    size,
    totalElements,
    totalPagesFromSearch,
    totalPagesFromAll,
  ]);

  const displayResults = useMemo(() => {
    return getDisplayResults();
  }, [getDisplayResults]);

  const results = displayResults.content || [];
  const totalPages = displayResults.totalPages || 0;

  const handleLoginRedirect = useCallback(() => {
    setShowLoginDialog(false);
    navigate("/sign-in");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-transparent">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center my-6 md:my-8">
          Tìm kiếm{" "}
          <span className="relative inline-block text-blue-500">
            công việc trong mơ của bạn
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 opacity-50"></span>
          </span>
        </h1>

        {/* Search Bar Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 md:mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập tên công việc hoặc từ khóa mong muốn"
                className="pl-10 w-full"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Select
                onValueChange={(value) => {
                  const newCityId = value === "all" ? "" : value;
                  const newFilters = { ...filters, cityId: newCityId };
                  handleFilterChange(newFilters);
                }}
                value={filters.cityId || "all"}
              >
                <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-gray-50">
                  <div className="flex items-center justify-between w-full">
                    <SelectValue
                      placeholder="Chọn địa điểm"
                      className="text-gray-500"
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <SelectGroup>
                    <SelectItem value="all">Tất cả địa điểm</SelectItem>
                    {cities
                      .filter((c) => c.cityName?.toLowerCase() !== "none")
                      .map((c) => (
                        <SelectItem key={c.cityId} value={c.cityId}>
                          {c.cityName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              className={`${
                isUsingSemanticSearch
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary bg-purple-600 hover:bg-purple-700"
              } text-white w-full md:w-auto`}
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
                  {isUsingSemanticSearch && (
                    <Sparkles size={16} className="ml-1" />
                  )}
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

        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:space-x-8 mt-6 md:mt-8">
          {/* Nút mở sidebar trên mobile */}
          <div className="md:hidden mb-4 relative z-[61]">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span>Bộ lọc</span>
              <Menu size={20} />
            </Button>
          </div>

          {/* Sidebar (Bộ lọc) - with higher z-index to overlap content */}
          <aside
            className={`
          w-full md:w-80 space-y-6 bg-white p-6 rounded-lg shadow-lg 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "block" : "hidden"} md:block md:transform-none
          relative z-[60] ${isSearching ? "opacity-50 pointer-events-none" : ""}
        `}
          >
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Loại công việc
                <ChevronDown
                  size={20}
                  className={`text-gray-500 cursor-pointer transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  onClick={() => setIsOpen(!isOpen)}
                />
              </h3>
              {isOpen && (
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
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Danh mục
                <ChevronDown
                  size={20}
                  className={`text-gray-500 cursor-pointer transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                />
              </h3>
              {isCategoryOpen && (
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
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Mức lương
                <ChevronDown
                  size={20}
                  className={`text-gray-500 cursor-pointer transform ${
                    isSalaryOpen ? "rotate-180" : ""
                  }`}
                  onClick={() => setIsSalaryOpen(!isSalaryOpen)}
                />
              </h3>
              {isSalaryOpen && (
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
              )}
            </div>
          </aside>

          {/* Nội dung công việc */}
          <div className="flex-grow space-y-4 relative z-[30]">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold">
                Tất cả công việc
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500">
                  Tổng số: {displayTotalElements} kết quả
                </span>
                <span className="text-sm font-bold text-gray-500">
                  | Trang {currentPage + 1}/{totalPages}
                </span>
              </div>
            </div>
            {results && results.length > 0 ? (
              <JobList_AllJob
                jobs={results}
                currentPage={currentPage}
                size={size}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  {isSearching
                    ? "Đang tìm kiếm công việc phù hợp..."
                    : "Không tìm thấy công việc nào phù hợp với tiêu chí của bạn."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal tìm kiếm */}
        {isSearching && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl w-11/12 max-w-md mx-auto z-50 border-t-4 border-purple-500 animate-fadeIn">
              <div className="text-center mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Đang tìm kiếm cho bạn
                </h2>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Chúng tôi đang phân tích hàng ngàn việc làm để tìm những công
                  việc phù hợp nhất
                </p>
              </div>
              <div className="mb-6 mt-6 md:mt-8">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    Tiến trình tìm kiếm
                  </span>
                  <span className="text-purple-600 font-medium">
                    {Math.round(searchProgress)}%
                  </span>
                </div>
                <ProgressBar value={searchProgress} className="h-2 md:h-3" />
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-100">
                <div className="flex">
                  <div className="w-auto mr-2 md:mr-3">
                    <div className="bg-purple-100 p-1 md:p-2 rounded-full">
                      <Sparkles size={16} className="text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-xs md:text-sm">
                      Đang thực hiện
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm mt-1">
                      {searchProgress < 30
                        ? "Phân tích yêu cầu của bạn"
                        : searchProgress < 60
                        ? "So khớp với công việc phù hợp"
                        : searchProgress < 90
                        ? "Xếp hạng kết quả tìm kiếm"
                        : "Hoàn tất tìm kiếm"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-5 text-center">
                <p className="text-xs text-gray-500">
                  Có thể mất 5-10 giây. Kết quả sẽ xuất hiện ngay sau đây.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Required Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center text-gray-800">
                Yêu cầu đăng nhập
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-gray-600 mb-4">
                Vui lòng đăng nhập để sử dụng tính năng tìm kiếm và lọc công
                việc
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
      </main>
    </div>
  );
}