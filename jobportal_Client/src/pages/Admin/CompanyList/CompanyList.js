import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "../../../ui/button";
import { MoreVertical, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllCompaniesForAdmin } from '../../../redux/Company/company.action';
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
  const { companies, loading, totalItems, totalPages } = useSelector((state) => state.company);
  const { allIndustries } = useSelector((state) => state.industry);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const navigate = useNavigate();

  // Thêm state cho filtered companies
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    dispatch(getAllCompaniesForAdmin(currentPage, pageSize));
    dispatch(getAllIndustries());
  }, [dispatch, currentPage, pageSize]);

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    let result = [...companies];
    
    // Tìm kiếm
    if (searchTerm) {
      result = result.filter(company => 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo ngành
    if (selectedIndustry !== 'all') {
      result = result.filter(company => 
        company.industry?.industryId.toString() === selectedIndustry
      );
    }

    setFilteredCompanies(result);
  }, [companies, searchTerm, selectedIndustry]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleIndustryChange = (e) => {
    setSelectedIndustry(e.target.value);
    setCurrentPage(0);
  };

  // Function to get industry name by ID
  const getIndustryName = (industryId) => {
    if (!allIndustries || !industryId) return 'N/A';
    const industry = allIndustries.find(ind => ind.industryId === industryId);
    return industry ? industry.industryName : 'N/A';
  };

  const handlePageChange = (newPage) => {
    dispatch(getAllCompaniesForAdmin(newPage, pageSize));
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    dispatch(getAllCompaniesForAdmin(0, newSize));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={handleIndustryChange}
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            Tổng số <span className="font-medium">{totalItems}</span> công ty
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Tên công ty</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Địa chỉ</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Lĩnh vực</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Ngày thành lập</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Số điện thoại</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Đang tải...</td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr key={company.companyId} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img
                        src={company.logo || '/default-logo.png'}
                        alt=""
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <span className="font-medium">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{company.address}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getIndustryName(company.industry?.industryId)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(company.establishedTime)}</td>
                  <td className="p-4 text-gray-500">{company.contact}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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

        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Trước
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sau
            </Button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Hiển thị</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-700">bản ghi mỗi trang</span>
            </div>
            
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Trang trước</span>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {[...Array(totalPages)].map((_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 1 && index <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === index
                          ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {index + 1}
                    </Button>
                  );
                } else if (
                  (index === currentPage - 2 && currentPage > 2) ||
                  (index === currentPage + 2 && currentPage < totalPages - 3)
                ) {
                  return (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Trang sau</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 