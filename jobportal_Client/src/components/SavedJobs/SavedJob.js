import React, { useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSavedJobs, saveJob } from "../../redux/Seeker/seeker.thunk";
import { Bookmark } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function SavedJobs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedJobs } = useSelector((store) => store.seeker);

  useEffect(() => {
    dispatch(getSavedJobs());
  }, [dispatch]);

  const handleJobClick = (postId) => {
    navigate(`/jobs/job-detail/${postId}`);
  };

  const handleUnsaveJob = async (e, postId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    
    try {
      // Hiển thị dialog xác nhận
      const result = await Swal.fire({
        title: "Xác nhận bỏ lưu",
        text: "Bạn có chắc chắn muốn bỏ lưu bài viết này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Bỏ lưu",
        cancelButtonText: "Hủy"
      });

      // Nếu người dùng xác nhận
      if (result.isConfirmed) {
        const response = await dispatch(saveJob(postId)).unwrap();
        
        if (response.action === "unsaved") {
          // Cập nhật lại danh sách saved jobs
          dispatch(getSavedJobs());
          toast.success(response.message);
        }
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast.error("Có lỗi xảy ra khi bỏ lưu bài viết");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Danh sách bài viết đã lưu
      </h1>
      <Card className="bg-white shadow-lg border rounded-lg">
        <CardContent className="p-6">
          {savedJobs && savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div
                  key={job.postId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleJobClick(job.postId)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={job.logo}
                        alt={`${job.companyName} logo`}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <Bookmark 
                        className="absolute -top-2 -right-2 text-purple-600" 
                        size={20} 
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600">{job.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => handleUnsaveJob(e, job.postId)}
                      className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
                    >
                      <Bookmark className="w-4 h-4" />
                      Bỏ lưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                Bạn chưa lưu bài viết nào.
              </p>
              <button
                onClick={() => navigate('/find-jobs')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Khám phá công việc ngay
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
