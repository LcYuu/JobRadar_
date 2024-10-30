import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent } from "../..//ui/card";
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
import {
  Search,
  MapPin,
  ChevronDown,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { countJobByType, getAllJobAction } from "../../redux/JobPost/jobPost.action";
import Pagination from "../../components/layout/Pagination";
import { store } from "../../redux/store";
import { getCity } from "../../redux/City/city.action";
import { getIndustryCount } from "../../redux/Industry/industry.action";

export default function JobSearchPage() {
  const [filters, setFilters] = useState({
    employmentType: {
      fullTime: false,
      partTime: false,
      remote: false,
      internship: false,
      contract: false,
    },
    categories: {
      design: false,
      sales: false,
      marketing: false,
      business: false,
      humanResource: false,
      finance: false,
      engineering: false,
      technology: false,
    },
    jobLevel: {
      entryLevel: false,
      midLevel: false,
      seniorLevel: false,
      director: false,
      vpOrAbove: false,
    },
    salaryRange: { range1: false, range2: false, range3: false, range4: false },
  });
  const dispatch = useDispatch();
  const {
    jobPost = [],
    totalPages,
    jobCountByType = [],
    loading,
    error,
  } = useSelector((store) => store.jobPost);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(7);

  const { cities = [] } = useSelector((store) => store.city);
  const { industryCount = [] } = useSelector((store) => store.industry);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(getAllJobAction(currentPage, size));
  }, [currentPage, size]);
  
  useEffect(() => {
    dispatch(getCity());
    dispatch(countJobByType());
    dispatch(getIndustryCount());
  }, []);
  
  const handleFilterChange = (category, item) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: {
        ...prevFilters[category],
        [item]: !prevFilters[category][item],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Tim kiếm{" "}
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
              />
            </div>

            <div className="relative w-64">
              {/* <MapPin className="absolute top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent >
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

            <Button className="bg-primary bg-purple-600 text-white">
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex space-x-8 mt-52">
          <aside className="w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Type of Work
                <ChevronDown size={20} />
              </h3>
              <div className="space-y-2">
              {jobCountByType.map(job => <div className="flex items-center">
                  
                  <Checkbox
                    id="full-time"
                    // checked={filters.employmentType.fullTime}
                    onCheckedChange={() =>
                      handleFilterChange("employmentType", "fullTime")
                    }
                  />
                  <label htmlFor="full-time" className="ml-2 text-sm">
                    {job.typeOfWork} ({job.count})
                  </label>
                </div>)}
              
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Categories
                <ChevronDown size={20} />
              </h3>
              <div className="space-y-2">
                {industryCount.map(industry => <div className="flex items-center">
                  <Checkbox
                    id="design"
                    checked={filters.categories.design}
                    onCheckedChange={() =>
                      handleFilterChange("categories", "design")
                    }
                  />
                  <label htmlFor="design" className="ml-2 text-sm">
                    {industry.industryName} ({industry.jobCount})
                  </label>
                </div>)}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Salary Range
                <ChevronDown size={20} />
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="700-1000"
                    checked={filters.salaryRange.range1}
                    onCheckedChange={() =>
                      handleFilterChange("salaryRange", "range1")
                    }
                  />
                  <label htmlFor="700-1000" className="ml-2 text-sm">
                    $700 - $1000 (4)
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="1000-1500"
                    checked={filters.salaryRange.range2}
                    onCheckedChange={() =>
                      handleFilterChange("salaryRange", "range2")
                    }
                  />
                  <label htmlFor="1000-1500" className="ml-2 text-sm">
                    $1000 - $1500 (6)
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="1500-2000"
                    checked={filters.salaryRange.range3}
                    onCheckedChange={() =>
                      handleFilterChange("salaryRange", "range3")
                    }
                  />
                  <label htmlFor="1500-2000" className="ml-2 text-sm">
                    $1500 - $2000 (10)
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="3000-above"
                    checked={filters.salaryRange.range4}
                    onCheckedChange={() =>
                      handleFilterChange("salaryRange", "range4")
                    }
                  />
                  <label htmlFor="3000-above" className="ml-2 text-sm">
                    $3000 or above (4)
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">All Jobs</h2>
                <span className="text-sm text-gray-500">
                  Showing {jobPost.length} results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sorting criteria " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      <SelectItem value="Most relevant">
                        Most relevant
                      </SelectItem>
                      <SelectItem value="Newest">Newest</SelectItem>
                      <SelectItem value="Oldest">Oldest</SelectItem>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Jobs</h2>
              <span className="text-sm text-gray-500">
                Showing {jobPost.length} results
              </span>
            </div>
            <JobList_AllJob jobs={jobPost} />
            <Pagination
              currentPage={currentPage}
              size={size}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
