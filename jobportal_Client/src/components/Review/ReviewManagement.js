import { StarRounded } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";
import anonymousIcon from "../../assets/icons/anonymous.png";

const RatingStars = React.memo(({ value, onChange, readOnly = false }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          <StarRounded
            className={`w-6 h-6 ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
});

const ReviewManagement = ({ review, role, index }) => {
  const isAnonymous = review.anonymous;
  const bgColor = index % 2 === 0 ? "bg-gray-100" : "bg-white";

  return (
    <>
      <div className={`flex items-start p-4 ${bgColor} rounded-lg`}>
        <img
          src={isAnonymous ? anonymousIcon : review.seeker.userAccount.avatar}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">
              {isAnonymous
                ? "Người dùng ẩn danh"
                : `${review.seeker.userAccount.userName[0]}${"*".repeat(
                    review.seeker.userAccount.userName.length - 2
                  )}${
                    review.seeker.userAccount.userName[
                      review.seeker.userAccount.userName.length - 1
                    ]
                  }`}
            </span>
          </div>
          {role === 1 && (
            <div className="flex items-center mb-2">
              <img
                src={review.company.logo}
                alt={review.company.companyName}
                className="w-10 h-10 object-cover mr-2 rounded-lg"
              />
              <span className="font-semibold text-gray-900">
                {review.company.companyName}
              </span>
            </div>
          )}
          <div className="flex items-center mb-2">
            <RatingStars value={review.star} readOnly />
          </div>
          <p className="text-gray-700 mt-2">{review.message}</p>
          <span className="text-sm text-gray-500 mt-2 text-right w-full block">
            {new Date(review.createDate).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <hr className="border-gray-300 rounded-lg" />
    </>
  );
};

export default ReviewManagement;
