import "./movie-detail.css";
import React, { useState, useEffect } from "react";
import ReviewList, { ReviewForm } from "./Review";
import MovieInfo from "./MovieInfo";
import ShowInfo from "../movie-list/showInfo";
import { getAppData, setAppData } from "../../utils/storage";
import type { Review, ZaalProp } from "../../utils/fake-data";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import type { Description } from "@mui/icons-material";


export interface ShowPropWithZaal {
    id: string;
    startDate: Date;
    endDate: Date;
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


function Movie_detail() {
    const { movieId } = useParams();
    const { user } = useUserContext();

    useEffect(() => {
        fetchAllMoviesFull();
    }, [movieId]);

    const [movieFull, setMovieFull] = useState<MoviePropFull>();

    const fetchAllMoviesFull = async () => {
        try {
            const response = await fetch(`http://localhost:5275/api/Films/GetById/Full?id=${movieId}`)
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