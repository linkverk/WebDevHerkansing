import { useState, useEffect } from "react";
import GenericSelect from "../../components/generic-select";
import MovieInfo from "../movie-detail/MovieInfo";
import MovieForm from "./movie-form";
import "./movie-panel.css";
import type { MoviePropFull } from "../../props/props";

function Movie_panel() {
    useEffect(() => {
        fetchAllMovies();
    }, []);

    const [movies, setMovies] = useState<MoviePropFull[]>([]);
    const emptyMovie: MoviePropFull = {
        id: '',
        name: '',
        duration: 0,
        rating: '',
        genre: '',
        description: '',
        shows: [],
        reviews:[],
    };

    const [selectedMovie, setSelectedMovie] = useState<MoviePropFull>(emptyMovie);
    const [poster, setPoster] = useState<string | undefined>(undefined);
    const [posterObject, setPosterObject] = useState<React.ChangeEvent<HTMLInputElement> | undefined>(undefined);

    const handlePosterDelete = async (movieId: string) => {
        await fetch(`http://localhost:5275/api/Posters?id=${movieId}`, {
            method: "DELETE"
        });
    }
    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>, movieId: string) => {

        const file = e.target.files?.[0];
        if (!file) return;

        setPoster(URL.createObjectURL(file));

        if (movieId === "") {
            setPosterObject(e)
            return;
        }

        const formData = new FormData();
        formData.append("poster", file);

        await fetch(`http://localhost:5275/api/Posters?id=${movieId}`, {
            method: "POST",
            body: formData
        });
    };

    const fetchAllMovies = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Films", { method: "GET" })
            const data: MoviePropFull[] = await response.json();
            setMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const handleSave = async () => {
        if (!poster || selectedMovie.name === "" || selectedMovie.genre === "" || selectedMovie.description === "" || selectedMovie.rating === "" || selectedMovie.duration === 0) {
            alert("Please enter all info.");
            return;
        }

        if (selectedMovie.id === "") {
            try {
                const response = await fetch("http://localhost:5275/api/Films", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selectedMovie),
                });
                if (response.ok) {
                    alert("Film added succesfully.");
                    const data: MoviePropFull = await response.json();
                    setMovies([...movies, data]);
                    setSelectedMovie(data);
                    if (posterObject) {
                        handlePosterUpload(posterObject, data.id)
                    }
                }
                else {
                    const text = await response.text();
                    alert(text);
                }
            } catch (err) {
                console.error("Failed to add movie:", err);
            };
        }
        else {
            try {
                const response = await fetch("http://localhost:5275/api/Films", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selectedMovie),
                });
                if (response.ok) {
                    alert("Film updated succesfully.");
                    const data: MoviePropFull = await response.json();
                    setMovies(movies.map((m) => (m.id === data.id ? data : m)));
                    setSelectedMovie(data);
                }
                else {
                    const text = await response.text();
                    alert(text);
                }
            } catch (err) {
                console.error("Failed to update movie:", err);
            };
        }
    };

    const handleDelete = async () => {
        if (selectedMovie.id === "") {
            alert("Please select a movie.");
            return;
        }

        if(selectedMovie.shows.length != 0)
        {
            alert("This movie has shows, first delete these shows.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5275/api/Films?id=${selectedMovie.id}`,
                {
                    method: "DELETE",
                });
            if (response.ok) {
                const updatedMovies = movies.filter(m => m.id !== selectedMovie.id);
                handlePosterDelete(selectedMovie.id);
                setMovies(updatedMovies);
                setSelectedMovie(emptyMovie);
                setPoster(undefined);
                setPosterObject(undefined);
                alert("Film deleted succesfully.");
            }
            else {
                alert("Film not delete, something went wrong.");
            }
        } catch (err) {
            console.error("Failed to delete movie:", err);
        };
    };

    return (
        <div className="movie-panel-container">
            <div className="movie-preview-side">
                <div className="top"><h1>Preview</h1></div>
                {(
                    <MovieInfo
                        poster={poster}
                        id={selectedMovie.id}
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
                        handlePosterUpload={handlePosterUpload}
                        handleSave={handleSave}
                    />
                </div>

                <div className="form-bottom">
                    <GenericSelect<MoviePropFull>
                        title="Select a Movie"
                        items={movies}
                        selectedItem={selectedMovie}
                        setSelectedItem={setSelectedMovie}
                        Label={(m) => m.name}
                        emptyItem={emptyMovie}
                    />
                    <button
                        className="delete-button"
                        onClick={() => {
                            handleDelete()
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
