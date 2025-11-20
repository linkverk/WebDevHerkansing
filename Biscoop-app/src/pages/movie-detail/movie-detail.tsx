import "./movie-detail.css";
import React, { useState, useEffect } from "react";
import ReviewList from "./ReviewList";
import MovieInfo from "./MovieInfo";
import ShowInfo from "../movie-list/showInfo";
import { getAppData, setAppData } from "../../utils/storage";
import type { Review, ZaalProp } from "../../utils/fake-data";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

export interface ShowPropWithZaal {
    id: string;
    start_date: Date;
    end_date: Date;
    movieId: string;
    zaalId: string;
    zaal: ZaalProp;
}

export interface MoviePropFull {
    id: string;
    name: string;
    duration: number;
    rating: string;
    genre: string;
    description: string;
    shows: ShowPropWithZaal[];
    reviews: Review[];
}

const ReviewForm: React.FC<{ movieId: string; onAdded: () => void }> = ({ movieId, onAdded }) => {
    // Use context to get current user
    const { user, isAuthenticated } = useUserContext();
    
    // Use user from context, fallback to localStorage
    const username = user.name || localStorage.getItem("username") || "Guest";
    const userId = user.id || localStorage.getItem("userId") || "";
    
    const [text, setText] = useState("");
    const [rating, setRating] = useState<number>(5);

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        
        const data = getAppData();
        const newReview = { 
            name: username, 
            text: text.trim(), 
            rating, 
            movieId,
            userId: userId // Include user ID for tracking
        };
        data.fakeReviews.push(newReview);
        setAppData(data);
        setText("");
        setRating(5);
        onAdded();
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
                <button className="btn" type="button" onClick={submit}>
                    Add review as {username}
                </button>
            </div>
        </div>
    );
};

function Movie_detail() {
    const { movieId } = useParams();
    const { user } = useUserContext();
    
    useEffect(() => {
        fetchAllMoviesFull();
    }, [movieId]);

    const [movieFull, setMovieFull] = useState<MoviePropFull>();

    const fetchAllMoviesFull = async () => {
        try {
            const response = await fetch(`http://localhost:5275/api/Films/GetById?id=${movieId}`)
            const data: MoviePropFull = await response.json();
            setMovieFull(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const reloadReviews = () => {
        // Reload from API if needed
        fetchAllMoviesFull();
    };

    return (
        <div className="container">
            {movieFull && (
                <>
                    <div className="room-info">
                        <h2>Room & Showtime Information</h2>
                        <ShowInfo shows={movieFull.shows} button={true} />
                    </div>

                    <div>
                        <MovieInfo
                            name={movieFull.name}
                            duration={movieFull.duration}
                            rating={movieFull.rating}
                            genre={movieFull.genre}
                            includeDescription={true}
                            description={movieFull.description}
                            className="movie-info"
                            posterClass="poster"
                            textClass="info"
                        />
                    </div>

                    <div className="reviews">
                        <h2>Reviews</h2>
                        <ReviewList reviews={movieFull.reviews} />
                        <h3>Add a review</h3>
                        <ReviewForm movieId={movieFull.id} onAdded={reloadReviews} />
                    </div>
                </>
            )}
        </div>
    )
}

export default Movie_detail