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
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

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
          
          <div className="bg-purple-50 p-6 rounded-lg mb-6">
            <div className="flex flex-col items-center mb-4">
              <div className="text-3xl font-bold text-center text-purple-700 mb-2">
                {Math.round(result.matching_score.totalScore)}%
              </div>
              <div className="text-center text-purple-600 text-lg font-medium">
                Mức độ phù hợp với công việc
              </div>
              <div className="mt-2 text-center text-purple-500 font-medium">
                {result.matching_score.suitabilityLevel}
              </div>
            </div>
            
            {result.matching_score.recommendations && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Nhận xét</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.matching_score.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-3 text-green-700">Kỹ năng phù hợp (Yêu cầu bắt buộc)</h4>
              {result.matching_score.matchedSkills.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.matching_score.matchedSkills.map((skill, index) => (
                    <li key={index} className="text-green-600">{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Không tìm thấy kỹ năng phù hợp</p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-3 text-red-700">Kỹ năng còn thiếu (Yêu cầu bắt buộc)</h4>
              {result.matching_score.missingSkills.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.matching_score.missingSkills.map((skill, index) => (
                    <li key={index} className="text-red-600">{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Bạn đã có tất cả các kỹ năng yêu cầu</p>
              )}
            </div>
          </div>
          
          {/* Nice-to-have skills section */}
          {result.matching_score.niceToHaveSkills && result.matching_score.niceToHaveSkills.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
              <h4 className="font-semibold mb-3 text-purple-700">Kỹ năng ưu tiên bổ sung (Nice-to-have) 
                <span className="text-sm font-normal text-gray-600 ml-2">- Điểm cộng nếu có</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.matching_score.niceToHaveSkills.map((skill, index) => (
                  <li key={index} className="text-purple-600">{skill}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.matching_score.extraSkills && result.matching_score.extraSkills.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
              <h4 className="font-semibold mb-3 text-blue-700">Kỹ năng bổ sung khác</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.matching_score.extraSkills.map((skill, index) => (
                  <li key={index} className="text-blue-600">{skill}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.matching_score.categorizedSkills && Object.keys(result.matching_score.categorizedSkills).length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
              <h4 className="font-semibold mb-3">Kỹ năng theo nhóm</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(result.matching_score.categorizedSkills).map(([category, skills]) => (
                  <div key={category} className="border rounded p-3">
                    <h5 className="font-medium mb-2 capitalize">{category.replace('_', ' ')}</h5>
                    <ul className="list-disc pl-5 text-sm">
                      {skills.map((skill, index) => (
                        <li key={index} className={
                          result.matching_score.matchedSkills.includes(skill) 
                            ? "text-green-600" 
                            : "text-gray-600"
                        }>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.matching_score.cvImprovementSuggestions && result.matching_score.cvImprovementSuggestions.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
              <h4 className="font-semibold mb-3 text-purple-700">Gợi ý cải thiện CV</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.matching_score.cvImprovementSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-purple-600">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
            <h4 className="font-semibold mb-3">Điểm chi tiết</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Kỹ năng:</span>
                  <span className="font-medium">{Math.round(result.matching_score.detailedScores.skills_match)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${Math.round(result.matching_score.detailedScores.skills_match)}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Học vấn:</span>
                  <span className="font-medium">{Math.round(result.matching_score.detailedScores.education_match)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${Math.round(result.matching_score.detailedScores.education_match)}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Kinh nghiệm:</span>
                  <span className="font-medium">{Math.round(result.matching_score.detailedScores.experience_match)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-600 h-2.5 rounded-full" style={{width: `${Math.round(result.matching_score.detailedScores.experience_match)}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Độ tương đồng tổng thể:</span>
                  <span className="font-medium">{Math.round(result.matching_score.detailedScores.overall_similarity)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${Math.round(result.matching_score.detailedScores.overall_similarity)}%`}}></div>
                </div>
              </div>
                <div>
                <div className="flex justify-between mb-1">
                  <span>Điểm ngữ cảnh:</span>
                  <span className="font-medium">{Math.round(result.matching_score.detailedScores.context_score)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-pink-600 h-2.5 rounded-full" style={{width: `${Math.round(result.matching_score.detailedScores.context_score)}%`}}></div>
                </div>
              </div>
              
              {/* Nice-to-have bonus score */}
              {result.matching_score.detailedScores.nice_to_have_bonus !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Điểm cộng ưu tiên bổ sung:</span>
                    <span className="font-medium text-purple-600">+{Math.round(result.matching_score.detailedScores.nice_to_have_bonus)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-400 h-2.5 rounded-full" style={{width: `${Math.min(Math.round(result.matching_score.detailedScores.nice_to_have_bonus), 20) * 5}%`}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Điểm thưởng cho kỹ năng nice-to-have (tối đa +20 điểm)</p>
                </div>
              )}
            </div>
          </div>
          
          {result.detailedAnalysis && (
            <div className="mt-4">
              <button 
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)} 
                className="flex items-center text-purple-600 font-medium hover:underline"
              >
                {showDetailedAnalysis ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Ẩn phân tích chi tiết
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Xem phân tích chi tiết
                  </>
                )}
              </button>
              
              {showDetailedAnalysis && (
                <div className="mt-4 space-y-6">
                  {/* Phân tích chi tiết về học vấn */}
                  {result.detailedAnalysis.education && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Chi tiết về học vấn</h4>
                      <div className="space-y-2 text-sm">
                        {result.detailedAnalysis.education.cv_level && (
                          <div>
                            <span className="font-medium">Trình độ trong CV:</span> {result.detailedAnalysis.education.cv_level}
                          </div>
                        )}
                        {result.detailedAnalysis.education.job_level && (
                          <div>
                            <span className="font-medium">Trình độ yêu cầu:</span> {result.detailedAnalysis.education.job_level}
                          </div>
                        )}
                        {result.detailedAnalysis.education.cv_majors && result.detailedAnalysis.education.cv_majors.length > 0 && (
                          <div>
                            <span className="font-medium">Chuyên ngành trong CV:</span> {result.detailedAnalysis.education.cv_majors.join(', ')}
                          </div>
                        )}
                        {result.detailedAnalysis.education.job_majors && result.detailedAnalysis.education.job_majors.length > 0 && (
                          <div>
                            <span className="font-medium">Chuyên ngành yêu cầu:</span> {result.detailedAnalysis.education.job_majors.join(', ')}
                          </div>
                        )}
                        {result.detailedAnalysis.education.reason && (
                          <div>
                            <span className="font-medium">Lý do:</span> {result.detailedAnalysis.education.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Phân tích chi tiết về kinh nghiệm */}
                  {result.detailedAnalysis.experience && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Chi tiết về kinh nghiệm</h4>
                      <div className="space-y-2 text-sm">
                        {result.detailedAnalysis.experience.cv_years !== undefined && (
                          <div>
                            <span className="font-medium">Số năm kinh nghiệm trong CV:</span> {result.detailedAnalysis.experience.cv_years} năm
                          </div>
                        )}
                        {result.detailedAnalysis.experience.job_years !== undefined && (
                          <div>
                            <span className="font-medium">Số năm kinh nghiệm yêu cầu:</span> {result.detailedAnalysis.experience.job_years} năm
                          </div>
                        )}
                        {result.detailedAnalysis.experience.tech_experience && (
                          <div>
                            <span className="font-medium">Kinh nghiệm với công nghệ:</span> {result.detailedAnalysis.experience.tech_experience.matched_skills?.join(', ') || 'Không có'}
                          </div>
                        )}
                        {result.detailedAnalysis.experience.reason && (
                          <div>
                            <span className="font-medium">Lý do:</span> {result.detailedAnalysis.experience.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Thông tin về trọng số đánh giá */}
                  {result.detailedAnalysis.weights && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Trọng số đánh giá</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Kỹ năng:</span> {(result.detailedAnalysis.weights.skills * 100).toFixed(0)}%
                        </div>
                        <div>
                          <span className="font-medium">Học vấn:</span> {(result.detailedAnalysis.weights.education * 100).toFixed(0)}%
                        </div>
                        <div>
                          <span className="font-medium">Kinh nghiệm:</span> {(result.detailedAnalysis.weights.experience * 100).toFixed(0)}%
                        </div>
                        <div>
                          <span className="font-medium">Tương đồng tổng thể:</span> {(result.detailedAnalysis.weights.overall_similarity * 100).toFixed(0)}%
                        </div>                        <div>
                          <span className="font-medium">Ngữ cảnh:</span> {(result.detailedAnalysis.weights.context * 100).toFixed(0)}%
                        </div>
                        {result.detailedAnalysis.weights.nice_to_have_bonus && (
                          <div className="text-purple-600">
                            <span className="font-medium">Điểm cộng nice-to-have:</span> {(result.detailedAnalysis.weights.nice_to_have_bonus * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills Source Analysis */}
                  {result.detailedAnalysis.skills && (result.detailedAnalysis.skills.skills_from_requirements_text?.length > 0 || 
                    result.detailedAnalysis.skills.skills_from_selected_list?.length > 0) && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Nguồn trích xuất kỹ năng yêu cầu</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2 text-blue-700">Từ danh sách kỹ năng được chọn:</h5>
                          {result.detailedAnalysis.skills.skills_from_selected_list?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {result.detailedAnalysis.skills.skills_from_selected_list.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">Không có kỹ năng từ danh sách được chọn</p>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2 text-green-700">Từ mô tả yêu cầu công việc:</h5>
                          {result.detailedAnalysis.skills.skills_from_requirements_text?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {result.detailedAnalysis.skills.skills_from_requirements_text.map((skill, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">Không có kỹ năng từ mô tả yêu cầu</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CVAnalyzer;