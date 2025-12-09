import { useState, useEffect } from "react";
import { formatDateForShowing } from "../../utils/date-fromatter";
import MovieInfo from "../movie-detail/MovieInfo";
import { type ShowProp, type MovieProp, type ZaalProp  } from "../../props/props";
import GenericSelect from "../../components/generic-select";
import "./show-panel.css";

function Show_panel() {
    useEffect(() => {
        fetchAllMovies();
        fetchAllShows();
        fetchAllRooms();
    }, []);

    const [shows, setShows] = useState<ShowProp[]>([]);
    const [movies, setMovies] = useState<MovieProp[]>([]);
    const [rooms, setRooms] = useState<ZaalProp[]>([]);

    const fetchAllMovies = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Films")
            const data: MovieProp[] = await response.json();
            setMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const fetchAllRooms = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Rooms")
            const data: ZaalProp[] = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const fetchAllShows = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Shows")
            const data: ShowProp[] = await response.json();

            const mappedData = data.map(s => ({
                ...s,
                startDate: s.startDate ? new Date(s.startDate) : undefined,
                endDate: s.endDate ? new Date(s.endDate) : undefined
            }));

            setShows(mappedData);

        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const emptyShow: ShowProp = {
        id: '',
        filmId: '',
        roomId: '',
        startDate: undefined,
        endDate: undefined,
    };
    const [selectedShow, setSelectedShow] = useState<ShowProp>(emptyShow);
    const emptyMovie: MovieProp = {
        id: '',
        name: '',
        duration: 0,
        rating: '',
        genre: '',
        description: '',
    };
    const [selectedMovie, setSelectedMovie] = useState<MovieProp>(emptyMovie);
    const emptyZaal: ZaalProp = {
        id: '',
        naam: '',
        rijen: 0,
        stoelenPerRij: 0,
    };
    const [selectedzaal, setSelectedZaal] = useState<ZaalProp>(emptyZaal);

    const handleSave = async () => {
        if (selectedzaal.id == "" || !selectedShow || selectedMovie.id == "" || !selectedShow.endDate || !selectedShow.startDate) {
            alert("Please enter all info.");
            return;
        }

        selectedShow.filmId = selectedMovie.id;
        selectedShow.roomId = selectedzaal.id;

        if (selectedShow.startDate > selectedShow.endDate) {
            alert("Start date can't be after end date.");
            return;
        }

        const showEnd = new Date(selectedShow.startDate.getTime() + selectedMovie.duration * 60000);
        if (showEnd > selectedShow.endDate) {
            alert("Show isn't long enough.");
            return;
        }

        try {
            if (selectedShow.id === "") {
                try {
                    const response = await fetch("http://localhost:5275/api/Shows", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedShow),
                    });
                    if (response.ok) {
                        alert("Show added succesfully.");
                        const data: ShowProp = await response.json();
                        data.endDate = data.endDate ? new Date(data.endDate) : undefined;
                        data.startDate = data.startDate ? new Date(data.startDate) : undefined;
                        setShows([...shows, data]);
                        setSelectedShow(data);
                    }
                    else {
                        const text = await response.text();
                        alert(text);
                    }
                } catch (err) {
                    console.error("Failed to add Show:", err);
                };
            }
            else {
                try {
                    const response = await fetch("http://localhost:5275/api/Shows", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedShow),
                    });
                    if (response.ok) {
                        alert("Show updated succesfully.");
                        const data: ShowProp = await response.json();
                        data.endDate = data.endDate ? new Date(data.endDate) : undefined;
                        data.startDate = data.startDate ? new Date(data.startDate) : undefined;
                        setShows(shows.map((s) => (s.id === data.id ? data : s)));
                        setSelectedShow(data);
                    }
                    else {
                        const text = await response.text();
                        alert(text);
                    }
                } catch (err) {
                    console.error("Failed to update Show:", err);
                };
            }
        } catch (err) {
            console.error("Failed to add or update Show:", err);
        };

    };

    const handleDelete = async () => {
        if (selectedShow.id === "") {
            alert("Please select a Show.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5275/api/Shows?id=${selectedShow.id}`,
                {method: "Delete"}
            );
            if (response.ok) {
                const updatedShows = shows.filter(s => s.id !== selectedShow.id);
                setShows(updatedShows);
                setSelectedShow(emptyShow);
                setSelectedMovie(emptyMovie);
                setSelectedZaal(emptyZaal);
                alert("Show delete succesfully");
            }
            else {
                alert("Show not delete, something went wrong.");
            }
        } catch (err) {
            console.error("Failed to delete Show:", err);
        };
    };

    function formatDateForInput(date?: Date | string): string {
        if (!date) return "";
        if (typeof date === "string") return date;
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 16);
    }

    return (
        <div className="movie-panel-container">
            <div className="movie-preview-side">
                <div className="top"><h1>Preview</h1></div>
                {selectedMovie.id != "" && (
                    <MovieInfo
                        id={selectedMovie.id as string}
                        name={selectedMovie?.name}
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
                {selectedzaal.id != "" &&
                    <div id="info">
                        <div>
                            <span className="label">Show name:</span> {selectedzaal?.naam}
                        </div>
                        <div>
                            <span className="label">Total Seats:</span> {selectedzaal?.stoelenPerRij * selectedzaal.rijen}
                        </div>
                    </div>
                }
                {selectedShow.startDate &&
                    <div id="info">
                        <div>
                            <span className="label">Start date:</span> {formatDateForShowing(selectedShow.startDate)}
                        </div>
                    </div>
                }
                {selectedShow.endDate &&
                    <div id="info">
                        <div>
                            <span className="label">End date:</span> {formatDateForShowing(selectedShow.endDate)}
                        </div>
                    </div>
                }
            </div>

            <div className="movie-form-side">
                <div className="form-top">
                    <h2>{selectedShow?.id ? "Edit show info" : "Add show info"}</h2>

                    <GenericSelect<MovieProp>
                        title="Select a Movie"
                        items={movies}
                        selectedItem={selectedMovie}
                        setSelectedItem={setSelectedMovie}
                        Label={(m) => m.name}
                        emptyItem={emptyMovie}
                    />

                    <GenericSelect<ZaalProp>
                        title="Select a Room"
                        items={rooms}
                        selectedItem={selectedzaal}
                        setSelectedItem={setSelectedZaal}
                        Label={(z) => z.naam}
                        emptyItem={emptyZaal}
                    />

                    <div className="form-group">
                        <label>start date:</label>
                        <input
                            type="datetime-local"
                            value={formatDateForInput(selectedShow.startDate)}
                            onChange={(e) => setSelectedShow({ ...selectedShow, startDate: new Date(e.target.value) })}
                        />
                    </div>

                    <div className="form-group">
                        <label>end date:</label>
                        <input
                            type="datetime-local"
                            value={formatDateForInput(selectedShow.endDate)}
                            onChange={(e) => setSelectedShow({ ...selectedShow, endDate: new Date(e.target.value) })}
                        />
                    </div>

                    <button onClick={handleSave} className="save-button">
                        {selectedShow?.id ? "Update Show" : "Save Show"}
                    </button>
                </div>

                <div className="form-bottom">
                    <h3>Select a show</h3>
                    <select
                        value={selectedShow?.id || ""}
                        onChange={(e) => {
                            const show = shows.find((s) => s.id === e.target.value) || emptyShow;
                            setSelectedShow(show);
                            setSelectedZaal(rooms.find(r => r.id === show.roomId) ?? emptyZaal);
                            setSelectedMovie(movies.find(m => m.id === show.filmId) ?? emptyMovie);
                        }}
                    >
                        <option value="">-- Pick a Show --</option>
                        {shows.map((show) => (
                            <option key={show.id} value={show.id}>
                                {movies.find(m => m.id === show.filmId)?.name ?? "N/A"} - {rooms.find(z => z.id === show.roomId)?.naam ?? "N/A"}
                            </option>
                        ))}
                    </select>

                    <button
                        className="delete-button"
                        onClick={() => {
                            handleDelete()
                        }}
                    >
                        Delete Show
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Show_panel;
