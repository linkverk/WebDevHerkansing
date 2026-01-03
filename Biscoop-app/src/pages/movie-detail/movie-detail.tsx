import "./movie-detail.css";
import React, { useState, useEffect } from "react";
import ReviewList, { ReviewForm } from "./Review";
import MovieInfo from "./MovieInfo";
import ShowInfo from "../movie-list/showInfo";
import { getAppData, setAppData } from "../../utils/storage";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { type MoviePropFull, type Review} from "../../props/props";


function Movie_detail() {
    const { movieId } = useParams();
    const { user } = useUserContext();

    useEffect(() => {
        fetchMovieFull();
    }, [movieId]);

    const [movieFull, setMovieFull] = useState<MoviePropFull>();

    const fetchMovieFull = async () => {
        try {
            const response = await fetch(`http://localhost:5275/api/Films/${movieId}`)
            const data: MoviePropFull = await response.json();
            setMovieFull(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const reloadReviews = () => {
        // Reload from API if needed
        fetchMovieFull();
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
                            id={movieFull.id}
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
                        <ReviewList reviews={movieFull.reviews} onSaved={reloadReviews} />
                        <h3>Add a review</h3>
                        <ReviewForm movieId={movieFull.id} onAdded={reloadReviews} />
                    </div>
                </>
            )}
        </div>
    )
}

export default Movie_detail