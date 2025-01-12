import { Link, useNavigate, useParams } from "react-router-dom";
import VideoAudioJoin from "./WaitingRoomComponents/VideoAudioJoin";
const WaitingRoom = ({
  showAlert,
}: {
  showAlert: (message: string) => void;
}) => {


  return (
    <div className="flex justify-center items-center h-full w-full">
      <Link
        to={"/"}
        className="absolute top-0 left-0 m-2 rounded-lg text-2xl transition-all  text-white font-bold  bg-red-600 hover:bg-red-800  p-2"
      >
        Back
      </Link>
    <VideoAudioJoin showAlert={showAlert}/>
    </div>
  );
};

export default WaitingRoom;
