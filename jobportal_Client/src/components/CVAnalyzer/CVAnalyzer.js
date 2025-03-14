// src/components/CVAnalyzer/CVAnalyzer.js
import React, { useState } from 'react';
import { Button } from "../../ui/button";
import { toast } from "react-toastify";
import { Card } from "../../ui/card";

const CVAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith('.docx')) {
        toast.error("Chỉ chấp nhận file PDF hoặc DOCX");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn CV để phân tích");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Vui lòng nhập mô tả công việc");
      return;
    }

    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Lỗi khi phân tích CV');
      }

      const data = await response.json();
      console.log("Raw API response:", JSON.stringify(data, null, 2));
      setResult(data);
      toast.success("Phân tích CV thành công!");
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error("Có lỗi xảy ra khi phân tích CV");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Phân tích CV với AI</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tải lên CV của bạn</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {!selectedFile ? (
            <div>
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-purple-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-medium">Nhấp vào đây để đính kèm CV</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-gray-700 font-medium">{selectedFile.name}</span>
              </div>
              <div className="text-sm text-gray-500">
                Kích thước: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-sm text-red-600 hover:underline"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Mô tả công việc</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          rows="6"
          placeholder="Nhập mô tả công việc bạn muốn ứng tuyển..."
        ></textarea>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="w-full bg-purple-600 text-white py-3 rounded-lg"
      >
        {analyzing ? "Đang phân tích..." : "Phân tích CV"}
      </Button>

      {result && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Kết quả phân tích</h3>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <div className="text-2xl font-bold text-center text-purple-700 mb-2">
              {Math.round(result.matching_score.totalScore)}%
            </div>
            <div className="text-center text-purple-600">
              Mức độ phù hợp với công việc
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Kỹ năng phù hợp</h4>
              <ul className="list-disc pl-5">
                {result.matching_score.matchedSkills.map((skill, index) => (
                  <li key={index} className="text-green-600">{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Kỹ năng còn thiếu</h4>
              <ul className="list-disc pl-5">
                {result.matching_score.missingSkills.map((skill, index) => (
                  <li key={index} className="text-red-600">{skill}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Điểm chi tiết</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Kỹ năng:</span>
                <span>{Math.round(result.matching_score.detailedScores.skills_match)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Học vấn:</span>
                <span>{Math.round(result.matching_score.detailedScores.education_match)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Kinh nghiệm:</span>
                <span>{Math.round(result.matching_score.detailedScores.experience_match)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng thể:</span>
                <span>{Math.round(result.matching_score.detailedScores.overall_similarity)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CVAnalyzer;