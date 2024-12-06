import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSurveyStatistics } from '../../../redux/Survey/survey.action';
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const SurveyStatistics = () => {
    const dispatch = useDispatch();
    const navigate= useNavigate();
    const { statistics, loading } = useSelector(state => state.survey);

    useEffect(() => {
        dispatch(getSurveyStatistics());
    }, [dispatch]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
        <Button
            variant="ghost"
            className="flex items-center gap-2 mb-6 hover:bg-gray-100"
            onClick={() => navigate(-1)}
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở lại danh sách</span>
        </Button>
            <h1 className="text-2xl font-bold mb-6">Thống kê khảo sát</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                    <h3 className="text-gray-600">Tổng số khảo sát</h3>
                    <p className="text-2xl font-bold">{statistics?.totalSurveys}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-gray-600">Đã hoàn thành</h3>
                    <p className="text-2xl font-bold">{statistics?.completedSurveys}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-gray-600">Chưa hoàn thành</h3>
                    <p className="text-2xl font-bold">{statistics?.pendingSurveys}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-gray-600">Trung bình ứng viên được tuyển</h3>
                    <p className="text-2xl font-bold">{statistics?.averageHiredCount?.toFixed(1)}</p>
                </Card>
            </div>

            <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Thống kê theo công ty</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên công ty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số khảo sát
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đã hoàn thành
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng ứng viên tuyển
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {statistics?.companySurveys?.map((company, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {company.companyName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {company.totalSurveys}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {company.completedSurveys}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {company.totalHired}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Phân bố chất lượng ứng viên</h2>
                <div className="grid grid-cols-5 gap-4">
                    {Object.entries(statistics?.candidateQualityDistribution || {}).map(([rating, count]) => (
                        <div key={rating} className="text-center">
                            <div className="text-xl">⭐ {rating}</div>
                            <div className="font-bold">{count}</div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Feedback gần đây</h2>
                <div className="space-y-4">
                    {statistics?.recentFeedback?.map((feedback, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded">
                            <div className="font-semibold">{feedback.companyName}</div>
                            <div className="text-gray-600 mt-1">{feedback.feedback}</div>
                            <div className="text-sm text-gray-500 mt-2">
                                {new Date(feedback.submittedAt).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SurveyStatistics; 