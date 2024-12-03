import React, { useState, useEffect } from "react";
import EmployerCard from "../common/EmployerCard/EmployerCard";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyPopular } from "../../redux/Company/company.action";

export default function TopListEmployers() {
  const dispatch = useDispatch();
  const { companies = [] } = useSelector((store) => store.company); // Đảm bảo `companies` là mảng rỗng mặc định
  const [currentImageIndexes, setCurrentImageIndexes] = useState([]);

  useEffect(() => {
    dispatch(getCompanyPopular());
  }, [dispatch]);

  useEffect(() => {
    if (companies.length > 0) {
      setCurrentImageIndexes(companies.map(() => 0));
    }
  }, [companies]);

  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: "#43bfb3" }}
        >
          Top nhà tuyển dụng phổ biến
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company, index) => (
            <EmployerCard key={index} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
