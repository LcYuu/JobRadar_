import React, { useState } from 'react';
import { Card, CardContent } from "../../ui/card";
import logo from '../../assets/images/common/logo.jpg';

const companies = [
  { id: 1, name: 'Nomad', logo: logo },
  { id: 2, name: 'Udacity', logo: logo },
  { id: 3, name: 'Packer', logo: logo },
  { id: 4, name: 'Divvy', logo: logo },
  { id: 5, name: 'DigitalOcean', logo: logo },
  // Add more companies as needed
];

export default function FavoriteCompanies() {
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(companies.length / companiesPerPage);
  const displayedCompanies = companies.slice(
    (currentPage - 1) * companiesPerPage,
    currentPage * companiesPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Danh sách công ty yêu thích</h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tất cả ({companies.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">STT</th>
                <th className="text-left p-2">Tên công ty</th>
              </tr>
            </thead>
            <tbody>
              {displayedCompanies.map((company, index) => (
                <tr key={company.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{index + 1 + (currentPage - 1) * companiesPerPage}</td>
                  <td className="p-2 flex items-center space-x-3">
                    <img src={company.logo} alt={`${company.name} logo`} className="h-8 w-8 rounded-full" />
                    <span>{company.name}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-l ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600'}`}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, pageIndex) => (
              <button
                key={pageIndex}
                onClick={() => handlePageChange(pageIndex + 1)}
                className={`px-3 py-1 border ${currentPage === pageIndex + 1 ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
              >
                {pageIndex + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-r ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600'}`}
            >
              &gt;
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
