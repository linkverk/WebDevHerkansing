import "./movie-detail.css";
import psychPoster from "../images/Psych-the-Movie-poster.webp";
import { useState } from "react";

function Movie_detail() {

    interface showtime{
        time: string;
        room: string;
        total: number;
        available: number;
    }

    const [selectedShowTime, setSelectedShowTime] = useState<showtime | null>(null);

    const showtimes: showtime[] = [
        { time: "1430", room: "Theater 5", total: 120, available: 84 },
        { time: "1700", room: "Theater 2", total: 150, available: 112 },
        { time: "1930", room: "Theater 3", total: 200, available: 90 },
        { time: "2215", room: "Theater 1", total: 100, available: 47 }
    ];

return(
    <div className="container">

        <div className="room-info">
        <h2>Room & Showtime Information</h2>

        {selectedShowTime && (
          <div id="info">
            <div><span className="label">Room:</span> {selectedShowTime.room}</div>
            <div><span className="label">Total Seats:</span> {selectedShowTime.total}</div>
            <div><span className="label">Seats Available:</span> {selectedShowTime.available}</div>
          </div>
        )}

        <div className="info showtimes">
            {showtimes.map((s) => (
                <button key={s.time} onClick={() => setSelectedShowTime(s)}>
                {`${s.time.slice(0, 2)}:${s.time.slice(2)}`}
                </button>
            ))}
        </div>
        </div>
        

        <div className="movie-info">
        <div className="poster">
            <img src={psychPoster} alt="Psych the movies" />
        </div>
        <div className="details">
            <h1>Psych: The Movie</h1>
            <div className="info"><span className="label">Duration:</span> 1h 28m</div>
            <div className="info"><span className="label">Rating:</span> PG-13</div>
            <div className="info"><span className="label">Genre:</span> Comedy, Mystery</div>
            <div className="info"><span className="label">Description:</span> 
            A comedic thriller and a continuation of the TV series, following Shawn Spencer and Burton Guster as they investigate an attack on Juliet O'Hara's partner, Samuel, which results in the theft of a device giving access to the San Francisco Police Department database.
            </div>
        </div>
        </div>

        <div className="reviews">
        <h2>Reviews</h2>
        <div className="review">
            <p><span className="label">Gee buternaps:</span> Fun to watch, i recommend a pineapple as snack. ⭐⭐⭐⭐☆</p>
        </div>
        <div className="review">
            <p><span className="label">Shawn:</span> Just because you put syrup on something doesn't make it pancakes. ⭐⭐⭐⭐⭐</p>
        </div>
        <div className="review">
            <p><span className="label">Gurton buster:</span> Perfect blend of comedy and mystery, exactly what I expected. ⭐⭐⭐⭐⭐</p>
        </div>
        </div>
    </div>    
    )
}

export default Movie_detail