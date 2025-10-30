import React from "react";

type Review = {
  name: string;
  text: string;
  rating: number;
};

type ReviewListProps = {
  reviews: Review[];
};

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const renderStars = (rating: number) => {
    const fullStars = "⭐".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return fullStars + emptyStars;
  };

  return (
    <div>
      {reviews.map((review, index) => (
        <div key={index}>
          <p>
            <span className="label">{review.name}:</span>{" "}
            {review.text} {renderStars(review.rating)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
