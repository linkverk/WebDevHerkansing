import React, { useState } from "react";
import type { Review } from "../../props/props";
import { useUserContext } from "../../context/UserContext";



interface EditReviewFormProps {
    review: Review;
    onSaved: () => void; // reload reviews after editing
}
export const ReviewForm: React.FC<{ movieId: string; onAdded: () => void }> = ({ movieId, onAdded }) => {
    // Use context to get current user
    const { user, isAuthenticated } = useUserContext();

    // Use user from context, fallback to localStorage
    const username = user.name || localStorage.getItem("username") || "Guest";
    const userId = user.id || localStorage.getItem("userId") || "";

    const [text, setText] = useState("");
    const [rating, setRating] = useState<number>(5);

    const submitReview = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!text.trim()) return;

        if (!userId || userId.trim() === "") {
            alert("You must be logged in to write a review.");
            return;
        }

        const newReview = {
            Id: "",
            userId: userId,
            filmId: movieId,
            rating: rating,
            description: text.trim()
        };

        try {
            const response = await fetch("http://localhost:5275/api/Review/Post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newReview)
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error("Backend error:", errorMessage);
                alert("Failed to submit review: " + errorMessage);
                return;
            }

            const createdReview = await response.json();
            console.log("Review successfully created:", createdReview);

            // Reset the form
            setText("");
            setRating(5);

            // Call your existing reload function
            onAdded();
        } catch (error) {
            console.error("Request failed:", error);
            alert("Unexpected error while sending review.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                padding: '1rem',
                backgroundColor: '#1a1a20',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#9ab0c9'
            }}>
                Please log in to write a review.
            </div>
        );
    }

    return (
        <div className="review-form">
            <div className="review-form-row">
                <label>Review</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="review-form-row small">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={4}>4</option>
                    <option value={3}>3</option>
                    <option value={2}>2</option>
                    <option value={1}>1</option>
                </select>
            </div>
            <div className="review-form-row">
                <button className="btn" type="button" onClick={submitReview}>
                    Add review as {username}
                </button>
            </div>
        </div>
    );
};
 const EditReviewForm: React.FC<EditReviewFormProps> = ({ review, onSaved }) => {
    const { user } = useUserContext();
    const [text, setText] = useState(review.description);
    const [rating, setRating] = useState<number>(review.rating);
    const [loading, setLoading] = useState(false);

    const submitEdit = async () => {
        if (!text.trim()) return;
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5275/api/Review/${review.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Description: text.trim(), Rating: rating }),
            });

            if (!response.ok) {
                const err = await response.text();
                alert("Failed to update review: " + err);
                setLoading(false);
                return;
            }

            setLoading(false);
            onSaved(); // reload reviews after edit
        } catch (error) {
            console.error(error);
            alert("Unexpected error while updating review.");
            setLoading(false);
        }
    };

    // Only show if review belongs to current user
    if (review.userId !== user.id) return null;

    return (
        <div className="edit-review-form">
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <button onClick={submitEdit} disabled={loading}>
                {loading ? "Saving..." : "Update Review"}
            </button>
        </div>
    );
};
const DeleteReviewButton: React.FC<{ reviewId: string; onDeleted: () => void }> = ({ reviewId, onDeleted }) => {
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const response = await fetch(`http://localhost:5275/api/Review/${reviewId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const err = await response.text();
                alert("Failed to delete review: " + err);
                return;
            }

            onDeleted(); // reload reviews after deletion
        } catch (error) {
            console.error(error);
            alert("Unexpected error while deleting review.");
        }
    };

    return (
        <button className="btn" onClick={handleDelete}>
            Delete
        </button>
    );
}
const ReviewList: React.FC<{
    reviews: Review[];
    onSaved?: () => void;
}> = ({ reviews, onSaved }) => {
    const { user } = useUserContext();
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

    return (
        <div className="review-list">
            {reviews.map((review) => {
                const isOwner = review.userId === user.id;
                const isEditing = editingReviewId === review.id;

                return (
                    <div key={review.id} className="review-item">
                        <div className="review-row">
                            {!isEditing && (
                                <>
                                    <div className="review-text">
                                        <p>{review.description}</p>
                                        <span>⭐ {review.rating}</span>
                                    </div>

                                    {isOwner && (
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => setEditingReviewId(review.id)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {isOwner && isEditing && (
                            <EditReviewForm
                                review={review}
                                onSaved={() => {
                                    setEditingReviewId(null);
                                    onSaved?.();
                                }}
                            />
                        )}
                        {isOwner && (
                            <DeleteReviewButton
                                reviewId={review.id}
                                onDeleted={() => {
                                    onSaved?.();
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewList;
