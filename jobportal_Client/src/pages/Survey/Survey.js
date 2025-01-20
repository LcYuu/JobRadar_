import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { submitSurvey } from '../../redux/Survey/survey.action';
import { ArrowLeft } from 'lucide-react';
import * as Yup from 'yup';

// Validation schema
const surveySchema = Yup.object().shape({
    hiredCount: Yup.number()
        .min(0, 'Số lượng không thể âm')
        .required('Vui lòng nhập số lượng ứng viên đã tuyển'),
    candidateQuality: Yup.number()
        .min(1, 'Vui lòng đánh giá chất lượng ứng viên')
        .max(5, 'Đánh giá tối đa 5 sao')
        .required('Vui lòng đánh giá chất lượng ứng viên'),
    feedback: Yup.string()
        .min(10, 'Góp ý cần ít nhất 10 ký tự')
        .required('Vui lòng nhập góp ý của bạn')
});

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

    const [errors, setErrors] = useState({});

    const validateForm = async () => {
        try {
            await surveySchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach(error => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        const isValid = await validateForm();
        if (!isValid) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            const result = await dispatch(submitSurvey(surveyId, formData));
            
            if (result.success) {
                toast.success('Cảm ơn bạn đã hoàn thành khảo sát!');
                navigate('/employer/account-management/job-management');
            } else {
                toast.error('Có lỗi xảy ra khi gửi khảo sát');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra: ' + error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="flex items-center gap-2 mb-6 hover:bg-gray-100"
                onClick={() => navigate('/employer/account-management/job-management')}
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Trở lại danh sách</span>
            </Button>

            <Card className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Khảo sát tuyển dụng</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2">
                            Số lượng ứng viên đã tuyển thành công <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.hiredCount}
                            onChange={(e) => setFormData({...formData, hiredCount: parseInt(e.target.value) || 0})}
                            className={`w-full p-2 border rounded ${errors.hiredCount ? 'border-red-500' : ''}`}
                        />
                        {errors.hiredCount && (
                            <p className="text-red-500 text-sm mt-1">{errors.hiredCount}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2">
                            Đánh giá chất lượng ứng viên <span className="text-red-500">*</span>
                        </label>
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
                        {errors.candidateQuality && (
                            <p className="text-red-500 text-sm mt-1">{errors.candidateQuality}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2">
                            Góp ý cải thiện <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.feedback}
                            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                            className={`w-full p-2 border rounded ${errors.feedback ? 'border-red-500' : ''}`}
                            rows="4"
                            placeholder="Vui lòng nhập ít nhất 10 ký tự"
                        />
                        {errors.feedback && (
                            <p className="text-red-500 text-sm mt-1">{errors.feedback}</p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi khảo sát'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Survey;