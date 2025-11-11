import "./movie-detail.css";
import React, { useState } from "react";
import ReviewList from "./ReviewList";
import MovieInfo from "./MovieInfo";
import ShowInfo from "../movie-list/showInfo";
import { getAppData, setAppData } from "../../utils/storage";
import { useParams } from "react-router-dom";


const getStoredUsername = () => {
    // support multiple keys used across the app: 'username' (lowercase) or 'userName' (from register)
    const a = localStorage.getItem("username");
    if (a) return a;
    // try registeredUser object
    const reg = localStorage.getItem("registeredUser");
    if (reg) {
        try {
            const parsed = JSON.parse(reg);
            if (parsed && parsed.name) return parsed.name;
        } catch (e) {
            // ignore
        }
    }
    return "Jhon Doe";
    //This needs to be fixed later, so that it fetches the correct username from localStorage
};

const ReviewForm: React.FC<{ movieId: string; onAdded: () => void }> = ({ movieId, onAdded }) => {
    const username = getStoredUsername();
    const [text, setText] = useState("");
    const [rating, setRating] = useState<number>(5);

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        const data = getAppData();
        const newReview = { name: username, text: text.trim(), rating, movieId };
        data.fakeReviews.push(newReview);
        setAppData(data);
        setText("");
        setRating(5);
        onAdded();
    };

    return (
        <form className="review-form" onSubmit={submit}>
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
                <button className="btn" type="submit">Add review as {username}</button>
            </div>
        </form>
    );
};

function Movie_detail() {
    const { movieId } = useParams();
    const { fakeMovies } = getAppData();
    const movie = fakeMovies.find((m) => m.id === movieId) ?? fakeMovies[0];

    // local state for reviews so the UI updates immediately when a review is added
    const [reviews, setReviews] = useState(() => getAppData().fakeReviews.filter(r => r.movieId === movie.id));

    const reloadReviews = () => {
        setReviews(getAppData().fakeReviews.filter(r => r.movieId === movie.id));
    };

    return (
        <div className="container">

            <div className="room-info">
                <h2>Room & Showtime Information</h2>
                <ShowInfo movieId={movie.id} button={true} />
            </div>

            <div>
                <MovieInfo
                    name={movie.name}
                    duration={movie.duration}
                    rating={movie.rating}
                    genre={movie.genre}
                    includeDescription={true}
                    description={movie.description}
                    className="movie-info"
                    posterClass="poster"
                    textClass="info"
                />
            </div>

            <div className="reviews">
                <h2>Reviews</h2>
                <ReviewList reviews={reviews} />
                <h3>Add a review</h3>
                <ReviewForm movieId={movie.id} onAdded={reloadReviews} />
            </div>
        </div>
    )
}

export default Movie_detail