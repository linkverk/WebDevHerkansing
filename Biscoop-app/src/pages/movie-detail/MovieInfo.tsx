import React from "react";

export interface MovieInfoProps {
  poster: string;
  title: string;
  duration: string;
  rating: string;
  genre: string;
  description: string;
}

const MovieInfo: React.FC<MovieInfoProps> = ({
  poster,
  title,
  duration,
  rating,
  genre,
  description,
}) => {
  return (
    <div className="movie-info">
      <div className="poster">
        <img
          src={poster} alt={title}
        />
      </div>

      <div className="details">
        <h1>{title}</h1>

        <div className="info">
          <span className="label">Duration:</span> {duration}
        </div>
        <div className="info">
          <span className="label">Rating:</span> {rating}
        </div>
        <div className="info">
          <span className="label">Genre:</span> {genre}
        </div>
        <div className="info">
          <span className="label">Description:</span> {description}
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
