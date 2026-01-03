import React from "react";
export interface ShowProp {
  id: string;
  startDate: Date | undefined;
  endDate: Date |undefined;
  filmId: string;
  roomId: string;
}
export interface ZaalPropFull {
  id: string;
  naam: string;
  rijen: number;
  stoelenPerRij: number;
  shows: ShowProp[]
}
interface ZaalFormProps {
    selectedZaal: ZaalPropFull;
    setSelectedZaal: React.Dispatch<React.SetStateAction<ZaalPropFull>>;
    handleSave: () => void;
}

const ZaalForm: React.FC<ZaalFormProps> = ({ selectedZaal, setSelectedZaal, handleSave }) => {
    return (
        <div className="form-top">
            <h2>{selectedZaal.id !== "" ? "Edit zaal" : "Add zaal Info"}</h2>

            <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    value={selectedZaal?.naam || ""}
                    onChange={(e) => setSelectedZaal({ ...selectedZaal, naam: e.target.value })}
                    placeholder="Enter name"
                />
            </div>

            <div className="form-group">
                <label>Rows:</label>
                <input
                    type="number"
                    value={selectedZaal?.rijen || ""}
                    onChange={(e) =>
                        setSelectedZaal({ ...selectedZaal, rijen: Number(e.target.value) })
                    }
                    placeholder="Enter number of rows"
                    min={0}
                    max={20}
                />
            </div>

            <div className="form-group">
                <label>Seats per Row:</label>
                <input
                    type="number"
                    value={selectedZaal.stoelenPerRij || ""}
                    onChange={(e) =>
                        setSelectedZaal({
                            ...selectedZaal, stoelenPerRij: Number(e.target.value),
                        })
                    }
                    placeholder="Enter seats per row"
                    min={0}
                    max={10}
                />
            </div>

            <button onClick={handleSave} className="save-button">
                {selectedZaal.id !== "" ? "Update zaal" : "Save zaal"}
            </button>
        </div>
    );
};

export default ZaalForm;