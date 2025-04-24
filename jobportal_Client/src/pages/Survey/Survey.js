import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { submitSurvey } from '../../redux/Survey/survey.action';

const Survey = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector(state => state.survey.loading);
    
    const [formData, setFormData] = useState({
        hiredCount: 0,
        candidateQuality: 0,
        feedback: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(submitSurvey(surveyId, formData));
        
        if (result.success) {
            toast.success('Cảm ơn bạn đã hoàn thành khảo sát!');
            navigate('/employer/account-management/job-management');
        } else {
            toast.error('Có lỗi xảy ra khi gửi khảo sát');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Khảo sát tuyển dụng</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2">Số lượng ứng viên đã tuyển thành công</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.hiredCount}
                            onChange={(e) => setFormData({...formData, hiredCount: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Đánh giá chất lượng ứng viên (1-5 sao)</label>
                        <div className="flex gap-2">
                            {[1,2,3,4,5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({...formData, candidateQuality: star})}
                                    className={`text-2xl ${formData.candidateQuality >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">Góp ý cải thiện</label>
                        <textarea
                            value={formData.feedback}
                            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="4"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 text-white">
                        Gửi khảo sát
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Survey;