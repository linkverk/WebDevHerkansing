import React, { useState } from "react";

interface MovieInfoProps {
  poster?: string;
  id: string;
  name: string;
  duration: number;
  rating: string;
  genre: string;
  includeDescription: boolean;
  description?: string;
  stars?: string;
  className?: string;
  posterClass?: string;
  textClass?: string;
}

const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".avif"];

const MovieInfo: React.FC<MovieInfoProps> = ({
  poster,
  id,
  name,
  duration,
  rating,
  genre,
  includeDescription,
  description,
  stars,
  className = "",
  posterClass = "",
  textClass = "",
}) => {
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);

  const handleError = () => {
    if (currentExtensionIndex < extensions.length - 1) {
      setCurrentExtensionIndex(currentExtensionIndex + 1);
    }
  };

  const posterPath =
    poster || `/images/movie_${id}${extensions[currentExtensionIndex]}`;

  return (
    <div className={`${className}`}>
      <img
        className={posterClass}
        src={posterPath}
        alt={name}
        onError={poster ? undefined : handleError}
      />

      <div className={textClass}>
        <h1>{name}</h1>
        <div>
          <span className="label">Duration:</span> {duration} min
        </div>
        <div>
          <span className="label">PG:</span> {rating}
        </div>
        <div>
          <span className="label">Genre:</span> {genre}
        </div>
        {includeDescription && (
          <div>
            <span className="label">Description:</span> {description}
          </div>
        )}
        {stars && (
          <div>
            <span className="label">Rating:</span> {stars}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;
