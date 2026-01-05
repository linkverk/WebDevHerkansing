import React from 'react';
import Seats from '../../components/Seats';
import { getAppData } from "../../utils/storage";
import { useParams } from "react-router-dom";

const ScreeningRoom: React.FC = () => {
  const { fakeZalen } = getAppData();
  const { zaalId, showId } = useParams();
  const zaal = fakeZalen.find((z) => z.id === zaalId) ?? fakeZalen[0];
  return (
    <Seats 
      zaal={zaal} 
      button={true} 
      showId={showId!} // 👈 pass showId down for reservation API
    />
  );
};


export default ScreeningRoom;
