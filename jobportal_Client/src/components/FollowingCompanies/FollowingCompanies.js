import React, { useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { getFollowedCompany } from "../../redux/Seeker/seeker.action";

export default function FavoriteCompanies() {
  const dispatch = useDispatch();
  const { followedCompany } = useSelector((store) => store.seeker);

  useEffect(() => {
    dispatch(getFollowedCompany());
  }, [dispatch]);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-700">Danh sách công ty yêu thích</h1>
      <Card className="shadow-lg border rounded-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-600">
              Số lượng công ty đã theo dõi: <span className="text-blue-600">{followedCompany.length}</span>
            </h2>
          </div>
          <table className="w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="text-left p-3 border-b">#</th>
                <th className="text-left p-3 border-b">Company Name</th>
              </tr>
            </thead>
            <tbody>
              {followedCompany.map((company, index) => (
                <tr
                  key={company.companyId}
                  className="border-b last:border-b-0 hover:bg-blue-50 transition duration-200 ease-in-out"
                >
                  <td className="p-3 font-medium text-gray-700">{index + 1}</td>
                  <td className="p-3 flex items-center space-x-3 text-gray-800">
                    <img
                      src={company.logo}
                      alt={`${company.companyName} logo`}
                      className="h-10 w-10 rounded-full shadow-sm border border-gray-300 hover:scale-105 transition-transform duration-200"
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
