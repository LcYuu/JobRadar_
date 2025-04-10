import React, { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useSelection from "antd/es/table/hooks/useSelection";
import { updateEmployer } from "../../redux/Auth/auth.thunk";

const VerifiedCompany = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [companyInfo, setCompanyInfo] = useState(null);
  const [taxCodeVerified, setTaxCodeVerified] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [companyData, setCompanyData] = useState({
    companyName: "",
    businessEmail: "",
    taxCode: "",
  });

  const employerFields = [
    { name: "taxCode", placeholder: "Mã số thuế", type: "text" },
    {
      name: "companyName",
      placeholder: "Tên công ty",
      type: "text",
      disabled: true,
    },
    { name: "businessEmail", placeholder: "Email doanh nghiệp", type: "email" },
  ];

  const addErrorMessage = (message) => {
    const id = Date.now();
    setErrorMessages((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setErrorMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 2000);
  };

  const verifyTaxCode = async (taxCode) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/company/validate-tax-info/${taxCode}`
      );
      if (response.data) {
        setCompanyInfo(response.data);
        setTaxCodeVerified(true);

        setCompanyData((prev) => ({
          ...prev,
          companyName: response.data.companyName,
          taxCode: taxCode,
        }));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying tax code:", error);
      addErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await dispatch(updateEmployer(companyData));
      const { payload } = response;
      console.log("🚀 ~ handleRegister ~ payload:", payload)

      if (payload.message === "Success") {
        setTimeout(async () => {
          await Swal.fire({
            icon: "success",
            title: "Đăng nhập thành công!",
            showConfirmButton: false,
            timer: 1500,
          });
        }, 1000); // Trễ một chút để đảm bảo điều hướng đã xảy ra
        navigate("/employer/account-management/dashboard");
      } else {
        // Hiển thị lỗi nếu đăng nhập thất bại
        await Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text: payload || "Có lỗi xảy ra khi đăng nhập",
          confirmButtonText: "Thử lại",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      // Xử lý lỗi không mong muốn
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Đã xảy ra lỗi không mong muốn",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#3085d6",
      });
    } finally {

    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <form className="space-y-6">
          <div className="space-y-4">
            {employerFields.map((field) => (
              <div key={field.name} className="relative flex items-center">
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  name={field.name}
                  value={companyData[field.name]}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log(`Updating ${field.name} to:`, newValue);
                    setCompanyData((prev) => {
                      const updated = { ...prev, [field.name]: newValue };
                      console.log("Updated companyData:", updated);
                      return updated;
                    });
                  }}
                  onBlur={(e) => {
                    if (field.name === "taxCode") {
                      console.log("Tax code onBlur value:", e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  disabled={field.disabled}
                />
                {field.name === "taxCode" && (
                  <Button
                    type="button"
                    onClick={async () => {
                      console.log("Verifying tax code:", companyData.taxCode);
                      const verified = await verifyTaxCode(companyData.taxCode);
                      if (!verified) {
                        addErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
                      }
                    }}
                    className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Xác thực
                  </Button>
                )}
              </div>
            ))}
          </div>
  
          <AnimatePresence mode="sync">
            {errorMessages.map((error) => (
              <motion.p
                key={error.id}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200"
              >
                {error.message}
              </motion.p>
            ))}
          </AnimatePresence>
  
          <Button
            onClick={handleRegister}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Đăng ký
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifiedCompany;
