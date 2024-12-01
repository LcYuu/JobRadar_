import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { getCity } from "../../redux/City/city.action";
import { getCompanyFitSeeker, searhCompanies } from "../../redux/Company/company.action";
import CompanyCard from "../../components/common/CompanyCard/CompanyCard";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAllIndustries } from "../../redux/Industry/industry.action";

export default function FindCompanies() {
  const dispatch = useDispatch();
  const { companyByFeature = [], companyFitSeeker = [], loading, error } = useSelector((store) => store.company);
  const { cities = [] } = useSelector((store) => store.city);
  const { allIndustries = [] } = useSelector(store => store.industry);

  const [filters, setFilters] = useState({
    title: "",
    cityId: "",
    industryId: "",
  });
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(6);
  const isFilterApplied = filters.title || filters.cityId || filters.industryId;

  const [selectedCategoryName, setSelectedCategoryName] = useState("Tất cả công ty");

  // Add new state for temporary filters
  const [tempFilters, setTempFilters] = useState({
    title: "",
    cityId: "",
    industryId: "",
  });

  useEffect(() => {
    dispatch(searhCompanies(filters, currentPage, size));
  }, [filters, currentPage, size, dispatch]);

  useEffect(() => {
    dispatch(getCity());
    dispatch(getCompanyFitSeeker());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllIndustries());
  }, [dispatch]);

  // Replace current filter change handlers with:
  const handleSearch = () => {
    setFilters(tempFilters); // Update main filters with temp values
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleCategoryChange = (industryId) => {
    setSelectedCategory(industryId);
    if (industryId === null) {
      setSelectedCategoryName("Tất cả công ty");
    } else {
      const selectedIndustry = allIndustries.find(industry => industry.industryId === industryId);
      setSelectedCategoryName(selectedIndustry?.industryName || "Tất cả công ty");
    }
    setTempFilters(prev => ({
      ...prev,
      industryId: industryId || ''
    }));
  };

  const filteredCompanies = selectedCategory
    ? companyByFeature.filter(company => company.industryId === selectedCategory)
    : companyByFeature;

  const hasFilteredCompanies = filteredCompanies.length > 0;
  const hasSuggestedCompanies = companyFitSeeker.length > 0;

  const uniqueCompanies = [...new Map(companyByFeature.map(company => [company.industryId, company])).values()];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center my-8">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Tìm kiếm{" "}
            <span className="relative inline-block text-primary text-blue-500">
              công ty yêu thích của bạn
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 opacity-50"></span>
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Tìm công ty mơ ước mà bạn muốn làm việc
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Nhập tên công ty hoặc từ khóa mong muốn"
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              value={tempFilters.title}
              onChange={(e) => {
                setTempFilters({ ...tempFilters, title: e.target.value });
              }}
            />
          </div>
          <div className="relative w-64">
            <Select
              onValueChange={(value) => {
                setTempFilters({ ...tempFilters, cityId: value });
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
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition duration-200"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Danh mục</h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategoryChange(null)}
              className={`hover:bg-gray-200 transition duration-200 ${selectedCategory === null ? 'bg-blue-500 text-white' : ''}`}
            >
              Tất cả ngành nghề
            </Button>
            {allIndustries.map((industry) => (
              <Button
                key={industry.industryId}
                variant={selectedCategory === industry.industryId ? "default" : "outline"}
                onClick={() => handleCategoryChange(industry.industryId)}
                className={`hover:bg-gray-200 transition duration-200 ${selectedCategory === industry.industryId ? 'bg-blue-500 text-white' : ''}`}
              >
                {industry.industryName}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedCategory === null ? (
                <span>Tất cả công ty</span>
              ) : (
                <>
                  Các công ty trong lĩnh vực{" "}
                  <span className="font-bold text-blue-600">
                    {selectedCategoryName}
                  </span>
                </>
              )}
            </h2>
            <p className="text-gray-500">
              {hasFilteredCompanies ? filteredCompanies.length : 0} kết quả
            </p>
          </div>
          {hasFilteredCompanies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Link 
                  to={`/companies/${company.companyId.toString()}`} 
                  className="block"
                  key={company.companyId}
                >
                  <Card className="p-6 space-y-4 transition-transform duration-300 hover:scale-105 cursor-pointer shadow-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={company.logo}
                        alt={`${company.companyName} logo`}
                        className="h-16 w-16 rounded-lg shadow-md"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{company.companyName}</h3>
                        <p className="text-sm text-primary">{company.countJob} công việc đang mở</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-xs">{company.industryName}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có kết quả nào phù hợp với tìm kiếm của bạn.</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Danh sách công ty đề xuất</h2>
          {hasSuggestedCompanies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyFitSeeker.map((company) => (
                <CompanyCard 
                  key={company.companyId} 
                  company={company} 
                  variant="suggested" 
                />
              ))} 
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có công ty đề xuất nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}