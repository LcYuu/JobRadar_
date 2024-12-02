import React, { useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { getFollowedCompany } from "../../redux/Seeker/seeker.action";
import { useNavigate } from "react-router-dom";

export default function FavoriteCompanies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { followedCompany } = useSelector((store) => store.seeker);

  useEffect(() => {
    dispatch(getFollowedCompany());
  }, [dispatch]);

  const handleCompanyClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-700">
        Danh sách công ty yêu thích
      </h1>
      <Card className="bg-white shadow-lg border rounded-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            {/* Thêm nội dung nếu cần */}
          </div>
          <table className="w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="text-left p-2">STT</th>
                <th className="text-left p-2">Tên công ty</th>
              </tr>
            </thead>
            <tbody>
              {followedCompany.map((company, index) => (
                <tr
                  key={company.companyId}
                  className="border-b last:border-b-0 hover:bg-blue-50 transition duration-200 ease-in-out cursor-pointer"
                  onClick={() => handleCompanyClick(company.companyId)}
                >
                  <td className="p-3 font-medium text-gray-700">{index + 1}</td>
                  <td className="p-3 flex items-center space-x-3 text-gray-800">
                    <img
                      src={company.logo}
                      alt={`${company.companyName} logo`}
                      className="h-10 w-10 rounded-full shadow-md border border-gray-300 hover:scale-105 transition-transform duration-200"
                    />
                    <span className="font-semibold">{company.companyName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
