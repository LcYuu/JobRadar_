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

import Pagination from "../../components/common/Pagination/Pagination";
import RangeSlider from "../../components/common/RangeSlider/RangeSlider";
import { useLocation } from "react-router-dom";
import { countJobByType, fetchSalaryRange, getAllJobAction, searchJobs, semanticSearchJobsWithGemini } from "../../redux/JobPost/jobPost.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { getIndustryCount } from "../../redux/Industry/industry.thunk";
import { toast } from "react-toastify";

import useWebSocket from "../../utils/useWebSocket";
import { ProgressBar } from "../../ui/progress";

export default function JobSearchPage() {
  const dispatch = useDispatch();
  const location = useLocation();

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
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(7);
  const [displayTotalElements, setDisplayTotalElements] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const [searchInput, setSearchInput] = useState(() => {
    return sessionStorage.getItem("searchInput") || "";
  });
  const [lastSearchQuery, setLastSearchQuery] = useState("");


  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);
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
  const [isLoading, setIsLoading] = useState(false);

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
 
  const [semanticSearchCache, setSemanticSearchCache] = useState({});

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
  const isFilterApplied =
    filters.title ||
    filters.cityId ||
    filters.selectedTypesOfWork.length ||
    filters.selectedIndustryIds.length ||
    (filters.minSalary !== undefined && filters.minSalary !== null) ||
    (filters.maxSalary !== undefined && filters.maxSalary !== null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  useEffect(() => {
    if (location.state?.selectedIndustryIds) {
      setFilters((prev) => ({
        ...prev,
        selectedIndustryIds: location.state.selectedIndustryIds,
      }));
    }
  }, [location]);

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

  const fetchRegularSearchResults = useCallback(() => {
    if (isFilterApplied) {
      dispatch(searchJobs({ filters, currentPage, size }));
    } else {
      dispatch(getAllJobAction({ currentPage, size }));
    }
  }, [dispatch, filters, currentPage, size, isFilterApplied]);

  useEffect(() => {
    if (!isUsingSemanticSearch) {
      fetchRegularSearchResults();
    }
  }, [fetchRegularSearchResults, isUsingSemanticSearch]);

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
      } 
      // Commented out to prevent infinite recursion with server
      // else if (topic === "/topic/industry-updates") {
      //   dispatch(getIndustryCount());
      // }
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
      behavior: "smooth"
    });
  };

  useEffect(() => {
    if (isFilterApplied) {
      setCurrentPage(0);
    }
  }, [filters]);

  const handleSalaryChange = (newValues) => {
    const newFilters = {
      ...filters,
      minSalary: newValues[0],
      maxSalary: newValues[1],
    };
    
    handleFilterChange(newFilters);
  };

  const createCacheKey = (query, filters) => {
    return `${query}-${JSON.stringify(filters)}`;
  };

  const filterSemanticResults = useCallback((results) => {
    if (!results || !results.content) return [];
    
    return results.content; 
  }, []);

  const paginateResults = useCallback((filteredResults, page, pageSize) => {
    return filteredResults;
  }, []);

  // Hàm trợ giúp để trích xuất industryId từ đối tượng job
  const extractIndustryId = useCallback((job) => {
    // Kiểm tra các vị trí phổ biến
    if (job.industry?.industryId) return job.industry.industryId;
    if (job.industryId) return job.industryId;
    if (job.industry?.id) return job.industry.id;
    if (job.industry_id) return job.industry_id;
    if (job.industryDTO?.industryId) return job.industryDTO.industryId;
    if (job.industryDTO?.id) return job.industryDTO.id;
    
    // Kiểm tra trong jobPost nếu có
    if (job.jobPost?.industry?.industryId) return job.jobPost.industry.industryId;
    if (job.jobPost?.industry?.id) return job.jobPost.industry.id;
    if (job.jobPost?.industryId) return job.jobPost.industryId;
    
    // Kiểm tra nếu industry là string
    if (typeof job.industry === 'string') return job.industry;
    
    // Tìm kiếm đệ quy trong đối tượng (giới hạn độ sâu để tránh vòng lặp vô hạn)
    const findIndustryIdRecursive = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 3) return null;
      
      // Tìm trực tiếp trong đối tượng hiện tại
      for (const key in obj) {
        // Tìm kiếm các thuộc tính có khả năng chứa industryId
        if (
          (key === 'industryId' || key === 'industry_id' || 
           (key === 'id' && (obj.name || obj.industryName))) && 
          (typeof obj[key] === 'string' || typeof obj[key] === 'number')
        ) {
          return obj[key];
        }
        
        // Nếu có thuộc tính 'industry', kiểm tra nó
        if (key === 'industry' && obj[key] && typeof obj[key] === 'object') {
          const industryObj = obj[key];
          if (industryObj.industryId) return industryObj.industryId;
          if (industryObj.id) return industryObj.id;
        }
      }
      
      // Tìm đệ quy trong các thuộc tính con
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          const result = findIndustryIdRecursive(obj[key], depth + 1);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    return findIndustryIdRecursive(job);
  }, []);

  const filterResultsLocally = useCallback((jobs, currentFilters) => {
    if (!jobs) return [];
    
    return jobs.filter(job => {
      // Debug toàn bộ cấu trúc job để kiểm tra
      console.log("Filtering job:", {
        id: job.postId || job.id,
        structure: Object.keys(job)
      });
      
      if (currentFilters.selectedTypesOfWork && currentFilters.selectedTypesOfWork.length > 0) {
        const jobType = typeof job.typeOfWork === 'string' ? job.typeOfWork : 
                        (job.typesOfWork?.name || 
                         job.typeOfWork?.name || 
                         job.typeOfJobWork || 
                         null);
                         
        console.log("Job type for filtering:", job.postId || job.id, jobType);
        
        if (!jobType || !currentFilters.selectedTypesOfWork.includes(jobType)) {
          return false;
        }
      }
      
      if (currentFilters.cityId) {
        const jobCityId = job.city?.cityId || job.cityId;
        if (!jobCityId || jobCityId !== currentFilters.cityId) {
          return false;
        }
      }
      
      if (currentFilters.selectedIndustryIds && currentFilters.selectedIndustryIds.length > 0) {
        // Sử dụng hàm trợ giúp để trích xuất industryId
        let jobIndustryId = extractIndustryId(job);
        
        // Chuyển đổi sang string để đảm bảo so sánh chính xác
        if (jobIndustryId !== null && jobIndustryId !== undefined) {
          jobIndustryId = String(jobIndustryId);
        }
        
        // Chuyển đổi selectedIndustryIds sang string để so sánh
        const selectedIndustryIdsAsString = currentFilters.selectedIndustryIds.map(id => String(id));
        
        console.log("Industry filtering:", {
          jobId: job.postId || job.id,
          jobIndustry: job.industry,
          extractedId: jobIndustryId,
          selectedIds: selectedIndustryIdsAsString,
          match: jobIndustryId ? selectedIndustryIdsAsString.includes(jobIndustryId) : false
        });
        
        if (!jobIndustryId || !selectedIndustryIdsAsString.includes(jobIndustryId)) {
          return false;
        }
      }
      
      if (currentFilters.minSalary !== undefined && currentFilters.minSalary !== null) {
        const jobSalary = job.salary || 0;
        if (jobSalary < currentFilters.minSalary) {
          return false;
        }
      }
      
      if (currentFilters.maxSalary !== undefined && currentFilters.maxSalary !== null) {
        const jobSalary = job.salary || 0;
        if (jobSalary > currentFilters.maxSalary) {
          return false;
        }
      }
      
      return true;
    });
  }, [extractIndustryId]);

  const handleFilterChange = useCallback((newFilters) => {
    console.log("Bộ lọc thay đổi:", newFilters);
    setFilters(newFilters);
    
    // Đánh dấu đã có tương tác
    setHasUserInteracted(true);
    
    if (isUsingSemanticSearch && allResults && allResults.content) {
      console.log("Áp dụng bộ lọc cho kết quả semantic search");
      
      const filteredResults = filterResultsLocally(allResults.content, newFilters);
      
      const newSemanticResults = {
        ...allResults,
        content: filteredResults,
        totalElements: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / size)
      };
      
      setSemanticResults(newSemanticResults);
      setCurrentPage(0);
    } else if (!isUsingSemanticSearch) {
      if (Object.values(newFilters).some(value => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
      })) {
        console.log("Áp dụng bộ lọc thông thường");
        dispatch(searchJobs({ filters: newFilters, page: 0, size }));
      } else {
        console.log("Không có bộ lọc, lấy tất cả công việc");
        dispatch(getAllJobAction({ page: 0, size }));
      }
    }
  }, [isUsingSemanticSearch, allResults, size, dispatch, filterResultsLocally]);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      return;
    }

    try {
      // Đánh dấu đã có tương tác
      setHasUserInteracted(true);
      
      setLastSearchQuery(searchInput);
      
      setIsSearching(true);
      setSearchProgress(5);
      
      const searchPhases = [
        { progress: 20, delay: 300 },
        { progress: 40, delay: 800 },
        { progress: 65, delay: 1300 },
        { progress: 85, delay: 1800 }
      ];
      
      searchPhases.forEach(phase => {
        setTimeout(() => {
          if (isSearching) {
            setSearchProgress(phase.progress);
          }
        }, phase.delay);
      });
      
      console.log("Gọi API semantic search với query:", searchInput);
      
      const result = await dispatch(semanticSearchJobsWithGemini({
        query: searchInput,
        filters: {},
        currentPage: 0,
        size: 100
      })).unwrap();

      setSearchProgress(100);
      
      if (!result || !result.content || !Array.isArray(result.content)) {
        console.error("Kết quả tìm kiếm ngữ nghĩa không hợp lệ:", result);
        throw new Error("Kết quả tìm kiếm không hợp lệ");
      }
      
      console.log("Nhận được kết quả tìm kiếm:", result.content.length, "công việc");
      
      setAllResults(result);
      
      // Kiểm tra và log cấu trúc dữ liệu của kết quả
      if (result.content.length > 0) {
        console.log("Mẫu kết quả đầu tiên:", {
          id: result.content[0].postId || result.content[0].id,
          structure: Object.keys(result.content[0]),
          industry: result.content[0].industry,
          industryId: extractIndustryId(result.content[0])
        });
      }
      
      const filteredResults = filterResultsLocally(result.content, filters);
      console.log("Số lượng kết quả sau khi lọc:", filteredResults.length);
      
      const filteredResult = {
        ...result,
        content: filteredResults,
        totalElements: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / size)
      };
      
      const cacheKey = `${searchInput}-${JSON.stringify(filters)}`;
      setSemanticSearchCache(prev => ({
        ...prev,
        [cacheKey]: filteredResult
      }));
      
      setSemanticResults(filteredResult);
      setIsUsingSemanticSearch(true);
      setCurrentPage(0);
      
      sessionStorage.setItem("lastSearchQuery", searchInput);
      sessionStorage.setItem("semanticResults", JSON.stringify(filteredResult));
      sessionStorage.setItem("allResults", JSON.stringify(result));
      sessionStorage.setItem("isUsingSemanticSearch", "true");
      
      toast.success(`Đã tìm thấy ${filteredResults.length} công việc phù hợp với bạn!`, {
        position: "top-right",
        autoClose: 3000
      });
      
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm ngữ nghĩa:", error);
      toast.error("Có lỗi khi tìm kiếm. Đang chuyển sang tìm kiếm thông thường.");
      
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

  useEffect(() => {
    if (isUsingSemanticSearch && searchInput.trim() && allResults) {
      console.log("Bộ lọc thay đổi, lọc kết quả trên client");
      
      const cacheKey = `${searchInput}-${JSON.stringify(filters)}`;
      
      const cachedResults = semanticSearchCache[cacheKey];
      
      if (cachedResults) {
        console.log("Sử dụng kết quả từ cache");
        setSemanticResults(cachedResults);
        setCurrentPage(0);
        return;
      }
      
      const filteredResults = filterResultsLocally(allResults.content, filters);
      console.log("Kết quả sau khi lọc:", filteredResults.length);
      
      const newResults = {
        ...allResults,
        content: filteredResults,
        totalElements: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / size)
      };
      
      setSemanticSearchCache(prev => ({
        ...prev,
        [cacheKey]: newResults
      }));
      
      setSemanticResults(newResults);
      setCurrentPage(0);
    }
  }, [filters, isUsingSemanticSearch, searchInput, allResults, filterResultsLocally, size]);

  const clearSemanticSearch = () => {
    setIsUsingSemanticSearch(false);
    setSemanticResults(null);
    setAllResults(null);
    setSearchInput("");
    setCurrentPage(0);
    
    setSemanticSearchCache({});
    
    sessionStorage.removeItem("searchInput");
    sessionStorage.removeItem("semanticResults");
    sessionStorage.removeItem("allResults");
    sessionStorage.setItem("isUsingSemanticSearch", "false");
    
    const hasActiveFilters = Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    });
    
    if (hasActiveFilters) {
      console.log("Có bộ lọc đang áp dụng, sử dụng searchJobs");
      dispatch(searchJobs({ filters, page: 0, size }));
    } else {
      console.log("Không có bộ lọc, lấy tất cả công việc");
      dispatch(getAllJobAction({ page: 0, size }));
    }
  };

  const paginateResultsLocally = (filteredResults, page, pageSize) => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredResults.slice(start, end);
  };

  const getDisplayResults = useCallback(() => {
    try {
      if (isUsingSemanticSearch && semanticResults) {
        console.log("Sử dụng kết quả từ tìm kiếm ngữ nghĩa:", semanticResults);
        
        if (!semanticResults.content || !Array.isArray(semanticResults.content)) {
          console.error("semanticResults.content không hợp lệ:", semanticResults.content);
          return {
            content: [],
            totalElements: 0,
            totalPages: 1
          };
        }
        
        const resultsArray = Array.isArray(semanticResults.content)   
          ? semanticResults.content 
          : [];
          
        console.log("Số lượng kết quả trước khi phân trang:", resultsArray.length);
        
        const totalResults = resultsArray.length || 0;
        const totalPages = Math.max(Math.ceil(totalResults / size) || 1, 1);
        
        const startIndex = currentPage * size;
        const endIndex = Math.min(startIndex + size, totalResults);
        
        console.log("Thông số phân trang:", { startIndex, endIndex, totalResults });
        
        const paginatedContent = totalResults > 0 
          ? resultsArray.slice(startIndex, endIndex) 
          : [];
          
        console.log("Số lượng kết quả hiển thị:", paginatedContent.length);
        
        return {
          content: paginatedContent,
          totalElements: totalResults,
          totalPages: totalPages
        };
      }

      if (isFilterApplied) {
        console.log("Sử dụng kết quả từ searchJobs với bộ lọc");
        return {
          content: searchJob || [],
          totalElements: displayTotalElements,
          totalPages: totalPagesFromSearch || 1
        };
      }

      console.log("Sử dụng tất cả công việc");
      return {
        content: jobPost || [],
        totalElements: displayTotalElements,
        totalPages: totalPagesFromAll || 1
      };
    } catch (error) {
      console.error("Lỗi trong getDisplayResults:", error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 1
      };
    }
  }, [isUsingSemanticSearch, semanticResults, isFilterApplied, 
      searchJob, jobPost, currentPage, size, displayTotalElements,
      totalPagesFromSearch, totalPagesFromAll]);

  const displayResults = getDisplayResults();
  const results = displayResults.content || [];
  const totalPages = displayResults.totalPages || 0;
  const totalResults = displayResults.totalElements || 0;

  useEffect(() => {
    const initializeSearchState = async () => {
      const savedIsUsingSemanticSearch = sessionStorage.getItem("isUsingSemanticSearch") === "true";
      const savedSearchInput = sessionStorage.getItem("searchInput");
      const savedAllResults = sessionStorage.getItem("allResults");
      const savedSemanticResults = sessionStorage.getItem("semanticResults");
      const savedFilters = sessionStorage.getItem("searchFilters");
      
      if (savedIsUsingSemanticSearch && savedSemanticResults && savedAllResults) {
        try {
          const parsedAllResults = JSON.parse(savedAllResults);
          const parsedSemanticResults = JSON.parse(savedSemanticResults);
          const parsedFilters = savedFilters ? JSON.parse(savedFilters) : filters;
          
          setIsUsingSemanticSearch(true);
          setAllResults(parsedAllResults);
          setSemanticResults(parsedSemanticResults);
          setFilters(parsedFilters);
          
          if (savedSearchInput) {
            setSearchInput(savedSearchInput);
          }
        } catch (e) {
          console.error("Lỗi khi khôi phục trạng thái tìm kiếm:", e);
          dispatch(getAllJobAction({ page: 0, size }));
        }
      } else if (!savedIsUsingSemanticSearch && isFilterApplied) {
        dispatch(searchJobs({ filters, page: 0, size }));
      } else {
        dispatch(getAllJobAction({ page: 0, size }));
      }
    };
    
    initializeSearchState();
  }, []);

  useEffect(() => {
    console.log("Pagination state updated:", {
      isUsingSemanticSearch,
      totalPages,
      currentPage
    });
  }, [isUsingSemanticSearch, totalPages, currentPage]);

  // Cập nhật displayTotalElements khi totalElements thay đổi
  useEffect(() => {
    setDisplayTotalElements(totalElements);
  }, [totalElements]);

  // Đánh dấu là đã có tương tác khi người dùng thay đổi bộ lọc
  useEffect(() => {
    if (isFilterApplied) {
      setHasUserInteracted(true);
    }
  }, [isFilterApplied]);

  // Đánh dấu là đã có tương tác khi người dùng tìm kiếm ngữ nghĩa
  useEffect(() => {
    if (isUsingSemanticSearch) {
      setHasUserInteracted(true);
    }
  }, [isUsingSemanticSearch]);

  const [isOpen, setIsOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isSalaryOpen, setIsSalaryOpen] = useState(true);
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

        <div className="flex space-x-8 mt-8">
          <aside className="w-80 space-y-6 bg-white p-6 rounded-lg shadow-lg">
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center text-gray-800 tracking-tight">
                Loại công việc
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 cursor-pointer transform ${isOpen ? 'rotate-180' : ''}`} 
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
                          checked={filters.selectedTypesOfWork.includes(job.typeOfWork)}
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
                  className={`text-gray-500 cursor-pointer transform ${isCategoryOpen ? 'rotate-180' : ''}`} 
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
                          checked={filters.selectedIndustryIds.includes(industry.industryId)}
                          onCheckedChange={(checked) => {
                            const updatedIndustryIds = checked
                              ? [...filters.selectedIndustryIds, industry.industryId]
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
                  className={`text-gray-500 cursor-pointer transform ${isSalaryOpen ? 'rotate-180' : ''}`} 
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
                      {minSalary ? `${(minSalary / 1000000).toFixed(0)}M` : "0M"} VNĐ
                    </span>
                    <span>
                      {maxSalary ? `${(maxSalary / 1000000).toFixed(0)}M` : "50M"} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Tất cả công việc</h2>
                {hasUserInteracted && (
                  <span className="text-sm font-bold text-gray-500">
                    Tổng số: {totalResults} kết quả
                  </span>
                )}
              </div>
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

        {isSearching && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-auto z-50 border-t-4 border-purple-500 animate-fadeIn">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Đang tìm kiếm cho bạn</h2>
                  <p className="text-gray-600 mt-1">Chúng tôi đang phân tích hàng ngàn việc làm để tìm những công việc phù hợp nhất</p>
                </div>
                
                <div className="mb-6 mt-8">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Tiến trình tìm kiếm</span>
                    <span className="text-purple-600 font-medium">{Math.round(searchProgress)}%</span>
                  </div>
                  <ProgressBar value={searchProgress} className="h-3" />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex">
                    <div className="w-auto mr-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Sparkles size={20} className="text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm">Đang thực hiện</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {searchProgress < 30 ? "Phân tích yêu cầu của bạn" : 
                         searchProgress < 60 ? "So khớp với công việc phù hợp" : 
                         searchProgress < 90 ? "Xếp hạng kết quả tìm kiếm" :
                         "Hoàn tất tìm kiếm"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 text-center">
                  <p className="text-xs text-gray-500">Có thể mất 5-10 giây. Kết quả sẽ xuất hiện ngay sau đây.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}