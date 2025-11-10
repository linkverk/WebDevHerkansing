import React, { useState } from "react";
// import { hashCode } from "../../utils/image-hascode";
import { getAppData, deleteItem, addItem, updateItem } from "../../utils/storage";
import GenericSelect from "../../components/generic-select";
import type { MovieProp } from "../../utils/fake-data";
import MovieInfo from "../movie-detail/MovieInfo";
import MovieForm from "./movie-form";
import "./movie-panel.css";

function Movie_panel() {
    const { fakeMovies } = getAppData();

    const [movies, setMovies] = useState<MovieProp[]>(fakeMovies);
    const emptyMovie: MovieProp = {
        id: '',
        name: '',
        duration: 0,
        rating: '',
        genre: '',
        description: '',
    };

    const [selectedMovie, setSelectedMovie] = useState<MovieProp>(emptyMovie);
    const [poster, setPoster] = useState<string | undefined>(undefined);

    // const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setPoster(URL.createObjectURL(file));
    //     }
    // };

    const handleSave = () => {
        if (!poster || selectedMovie.name === "" || selectedMovie.genre === "" || selectedMovie.description === "" || selectedMovie.rating === "" || selectedMovie.duration === 0) {
            alert("Please enter all info.");
            return;
        }

        if (selectedMovie.id !== "") {
            updateItem("fakeMovies", selectedMovie);
            alert("Movie updated!");
        } else {
            const newMovie: MovieProp = {
                id: crypto.randomUUID(),
                name: selectedMovie.name,
                description: selectedMovie.description,
                rating: selectedMovie.rating,
                genre: selectedMovie.genre,
                duration: selectedMovie.duration as number,
            };
            addItem("fakeMovies", newMovie);
            alert("Movie saved!");
        }

    };

    return (
        <div className="movie-panel-container">
            <div className="movie-preview-side">
                <div className="top"><h1>Preview</h1></div>
                {(
                    <MovieInfo
                        poster={poster}
                        name={selectedMovie.name}
                        duration={selectedMovie.duration as number}
                        rating={selectedMovie.rating}
                        genre={selectedMovie.genre}
                        includeDescription={true}
                        description={selectedMovie.description}
                        className="movie-info-preview"
                        posterClass="movie-preview-poster"
                        textClass="movie-preview-info"
                    />
                )}
            </div>

            <div className="movie-form-side">
                <div className="form-top">
                    <MovieForm
                        selectedMovie={selectedMovie}
                        setSelectedMovie={setSelectedMovie}
                        poster={poster}
                        setPoster={setPoster}
                        handleSave={handleSave}
                    />
                </div>

                <div className="form-bottom">
                    <GenericSelect<MovieProp>
                        title="Select a Movie"
                        items={movies}
                        selectedItem={selectedMovie}
                        setSelectedItem={setSelectedMovie}
                        getLabel={(m) => m.name}
                        emptyItem={emptyMovie}
                    />
                    <button
                        className="delete-button"
                        onClick={() => {
                            if (!selectedMovie) return;
                            const updatedMovies = movies.filter(m => m.id !== selectedMovie.id);
                            setMovies(updatedMovies);
                            setSelectedMovie(emptyMovie);
                            deleteItem("fakeMovies", selectedMovie.id);

                        }}
                    >
                        Delete Movie
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Movie_panel;
