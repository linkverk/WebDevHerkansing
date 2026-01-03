import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ShowInfo from "./showInfo";
import "./movie-list.css"
import MovieInfo from "../movie-detail/MovieInfo";
import { type MoviePropFull, type Review} from "../../props/props";


function MovieList() {
    useEffect(() => {
        fetchAllMoviesFull();
    }, []);

    const [moviesFull, setMoviesFull] = useState<MoviePropFull[]>([]);

    const fetchAllMoviesFull = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Films", {method: "GET"})
            const data: MoviePropFull[] = await response.json();
            setMoviesFull(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const renderStars = (rating: number) => {
        const fullStars = "★".repeat(Math.floor(rating));
        const halfStar = rating % 1 >= 0.5 ? "⯪" : "";
        const emptyStars = "☆".repeat(5 - Math.ceil(rating));
        return fullStars + halfStar + emptyStars;
    };

    const averageRating = (reviews: Review[]) => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return total / reviews.length;
    };

    return (
        <div className="movie-list">
            {moviesFull.map((item) => (
                <div className="movie-list-part">
                    <MovieInfo
                        id={item.id}
                        name={item.name ?? "N/A"}
                        duration={item.duration ?? 0}
                        rating={item.rating ?? "N/A"}
                        genre={item.genre ?? "N/A"}
                        stars={renderStars(averageRating(item.reviews.filter(r => r.filmId === item.id)))}
                        includeDescription={false}
                        className="movie-info-list"
                        posterClass="poster-movielist"
                        textClass="movie-info-text"
                    />
                    <ShowInfo shows={item.shows} button={false} />
                    <Link
                        key={item.id ?? "N/A"}
                        to={`/movie_detail/${item.id ?? ""}`}
                        title={item.id ?? "N/A"}
                        className="goto-button"
                    >
                        {"details"}
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default MovieList