import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "../../../ui/button";
import { MoreVertical, Filter, Search } from 'lucide-react';
import { getAllCompanies } from '../../../redux/Company/company.action';
import { getAllIndustries } from '../../../redux/Industry/industry.action';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (error) {
    return 'N/A';
  }
};

export default function CompanyList() {
  const dispatch = useDispatch();
  const { companies, loading, totalItems } = useSelector((state) => state.company);
  const { allIndustries } = useSelector((state) => state.industry);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  useEffect(() => {
    dispatch(getAllCompanies());
    dispatch(getAllIndustries());
  }, [dispatch]);

  useEffect(() => {
    if (companies) {
      let filtered = companies;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(company => 
          company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.contact?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by industry
      if (selectedIndustry !== 'all') {
        filtered = filtered.filter(company => 
          company.industry?.industryId === parseInt(selectedIndustry)
        );
      }

      setFilteredCompanies(filtered);
    }
  }, [companies, searchTerm, selectedIndustry]);

  // Function to get industry name by ID
  const getIndustryName = (industryId) => {
    if (!allIndustries || !industryId) return 'N/A';
    const industry = allIndustries.find(ind => ind.industryId === industryId);
    return industry ? industry.industryName : 'N/A';
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(filteredCompanies.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Tổng số công ty: {filteredCompanies.length}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả lĩnh vực</option>
            {allIndustries?.map((industry) => (
              <option key={industry.industryId} value={industry.industryId.toString()}>
                {industry.industryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="text-left p-4 w-1/4">Tên công ty</th>
              <th className="text-left p-4 w-1/6">Địa chỉ</th>
              <th className="text-left p-4 w-1/6">Lĩnh vực</th>
              <th className="text-left p-4 w-1/6">Ngày thành lập</th>
              <th className="text-left p-4 w-[150px]">Số điện thoại</th>
              <th className="text-left p-4 w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">Loading...</td>
              </tr>
            ) : (
              filteredCompanies?.map((company) => (
                <tr key={company.companyId} className="border-b">
                  <td className="p-4 truncate">
                    <div className="flex items-center gap-3">
                      <img 
                        src={company.logo || '/default-company-logo.png'} 
                        alt={company.companyName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="truncate">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="p-4 truncate">{company.address}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm whitespace-nowrap">
                      {getIndustryName(company.industry?.industryId)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{formatDate(company.establishedTime)}</td>
                  <td className="p-4 truncate">{company.contact}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/companies/${company.companyId}`)}>
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>View</span>
            <select 
              value={pageSize} 
              onChange={handlePageSizeChange}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>công ty mỗi trang</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              &lt;
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50">
              {currentPage + 1}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 