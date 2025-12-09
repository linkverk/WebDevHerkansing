import { useState, useEffect } from "react";
import GenericSelect from "../../components/generic-select";
import { type ZaalPropFull} from "../../props/props";
import ZaalForm from "./zaal-form";
import Seats from '../../components/Seats';
import "./zaal-panel.css";

function Zaal_panel() {
    useEffect(() => {
        fetchAllRooms();
    }, []);

    const fetchAllRooms = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Rooms")
            const data: ZaalPropFull[] = await response.json();
            setZalen(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const [zalen, setZalen] = useState<ZaalPropFull[]>([]);
    const emptyZaal: ZaalPropFull = {
        id: '',
        naam: '',
        rijen: 0,
        stoelenPerRij: 0,
        shows: [],
    };

    const [selectedZaal, setSelectedZaal] = useState<ZaalPropFull>(emptyZaal);

    const handleSave = async () => {
        if (selectedZaal.naam === "" || selectedZaal.rijen === 0 || selectedZaal.stoelenPerRij === 0) {
            alert("Please enter all info.");
            return;
        }

        if (selectedZaal.rijen > 20) {
            alert("Number of rows can not be more than 20.");
            return;
        }

        if (selectedZaal.stoelenPerRij > 10) {
            alert("There is a maximum of 10 seats per row.");
            return;
        }

        try {
            if (selectedZaal.id === "") {
                try {
                    const response = await fetch("http://localhost:5275/api/Rooms", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedZaal),
                    });
                    if (response.ok) {
                        alert("Room added succesfully.");
                        const data: ZaalPropFull = await response.json();
                        setZalen([...zalen, data]);
                        setSelectedZaal(data);
                    }
                    else {
                        const text = await response.text();
                        alert(text);
                    }
                } catch (err) {
                    console.error("Failed to add Room:", err);
                };
            }
            else {
                try {
                    const response = await fetch("http://localhost:5275/api/Rooms", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedZaal),
                    });
                    if (response.ok) {
                        alert("Room updated succesfully.");
                        const data: ZaalPropFull = await response.json();
                        setZalen(zalen.map((z) => (z.id === data.id ? data : z)));
                        setSelectedZaal(data);
                    }
                    else {
                        const text = await response.text();
                        alert(text);
                    }
                } catch (err) {
                    console.error("Failed to update room:", err);
                };
            }
        } catch (err) {
            console.error("Failed to add or update Room:", err);
        };
    };

    const handleDelete = async () => {
        if (selectedZaal.id === "") {
            alert("Please select a Room.");
            return;
        }

        if(selectedZaal.shows.length != 0){
            alert("this room has shows, first delete these shows.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5275/api/Rooms?id=${selectedZaal.id}`, {
                method: "Delete",
            });
            if (response.ok) {
                const updatedZalen = zalen.filter(z => z.id !== selectedZaal.id);
                setZalen(updatedZalen);
                setSelectedZaal(emptyZaal);
                alert("Room deleted succesfully.");
            }
            else {
                alert("Room not deleted, something went wrong.");
            }
        } catch (err) {
            console.error("Failed to delete Room:", err);
        };
    };


    return (
        <div className="movie-panel-container">
            <div className="movie-preview-side">
                <div className="top"><h1>Preview</h1></div>
                <div className="top"><h1>{selectedZaal.naam}</h1></div>
                <Seats
                    zaal={
                        {
                            id: "",
                            naam: selectedZaal.naam,
                            rijen: selectedZaal.rijen,
                            stoelenPerRij: selectedZaal.stoelenPerRij,
                        }
                    }
                    button={false}
                />
            </div>

            <div className="movie-form-side">
                <div className="form-top">
                    <ZaalForm
                        selectedZaal={selectedZaal}
                        setSelectedZaal={setSelectedZaal}
                        handleSave={handleSave}
                    />
                </div>

                <div className="form-bottom">
                    <GenericSelect<ZaalPropFull>
                        title="Select a Room"
                        items={zalen}
                        selectedItem={selectedZaal}
                        setSelectedItem={setSelectedZaal}
                        Label={(z) => z.naam}
                        emptyItem={emptyZaal}
                    />

                    <button
                        className="delete-button"
                        onClick={() => {
                            handleDelete()
                        }}
                    >
                        Delete Room
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Zaal_panel;
