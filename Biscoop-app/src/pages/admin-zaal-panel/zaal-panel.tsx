import { useState, useEffect } from "react";
import type { ZaalProp } from "../../utils/fake-data";
import GenericSelect from "../../components/generic-select";
import ZaalForm from "./zaal-form";
import Seats from '../../components/Seats';
import "./zaal-panel.css";

function Zaal_panel() {
    useEffect(() => {
        fetchAllRooms();
    }, []);

    const fetchAllRooms = async () => {
        try {
            const response = await fetch("http://localhost:5275/api/Rooms/GetAll")
            const data: ZaalProp[] = await response.json();
            setZalen(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        }
    };

    const [zalen, setZalen] = useState<ZaalProp[]>([]);
    const emptyZaal: ZaalProp = {
        id: '',
        naam: '',
        rijen: 0,
        stoelenPerRij: 0,
    };

    const [selectedZaal, setSelectedZaal] = useState<ZaalProp>(emptyZaal);

    const handleSave = async () => {
        if (selectedZaal.naam === "" || selectedZaal.rijen === 0 || selectedZaal.stoelenPerRij === 0) {
            alert("Please enter all info.");
            return;
        }

        const requestOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedZaal),
        };

        try {
            const response = await fetch("http://localhost:5275/api/Rooms/AddOrUpdate",
                requestOptions
            );
            if (response.ok) {
                alert("Room added or updated succesfully.");
                const data: ZaalProp = await response.json();
                console.log(data)
                if (zalen.find((z) => z.id === data.id)) {
                    setZalen(zalen.map((z) => (z.id === data.id ? data : z)));
                    setSelectedZaal(data);
                } else {
                    setZalen([...zalen, data]);
                    setSelectedZaal(data);
                }
            }
            else {
                alert("Room not saved, something went wrong.");
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

        const requestOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedZaal),
        };

        try {
            const response = await fetch("http://localhost:5275/api/Rooms/Delete",
                requestOptions
            );
            if (response.ok) {
                const updatedZalen = zalen.filter(z => z.id !== selectedZaal.id);
                setZalen(updatedZalen);
                setSelectedZaal(emptyZaal);
            }
            else {
                alert("Room not delete, something went wrong.");
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
                    <GenericSelect<ZaalProp>
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
