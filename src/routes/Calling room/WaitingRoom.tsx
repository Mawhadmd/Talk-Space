import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { useContext, useEffect, useState } from "react";
import VideoAudioJoin from "./VideosComponents/VideoAudioJoin";
const WaitingRoom = () => {
  const [RoomStatus, setRoomStatus] = useState<number>();
  const { showAlert, MainSocket } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if(!MainSocket) return
    let t = false;
    console.log("connected");
    MainSocket
      .timeout(2000)
      .emit(
        "RoomCreation",
        id,
        (err: Error | null, response: string, responseid: number) => {
          if (t) return;
          if(responseid==1){
            navigate(`/InCall/${id}`)
            return
          }
          if (responseid) {
            setRoomStatus(responseid);
          }

          if (err) {
            console.log("Acknowledgment failed:", err);
            showAlert("Error: Unable to create room. Going Back");
            setTimeout(() => {
              navigate("/");
            }, 3000);
          } else {
            console.log("Acknowledgment received:", response);
            showAlert(response);
          }
        }
      );
    return () => {
      t = true;
    };
  }, [id,MainSocket]);

  function handlejoinrequest() {
    if (RoomStatus != 2) return;
    setRoomStatus(3);
    const timeoutId = setTimeout(() => {
      console.log('Ignored');
      setRoomStatus(2);
    }, 10000);
    MainSocket?.emit('RequestAccess', id);
    MainSocket?.on('Accepted', () => {
      clearTimeout(timeoutId);
      MainSocket.emit('joinroom', id);
      setTimeout(() => {
        navigate(`/InCall/${id}`);
      }, 222);
    });
  }
  
  return (
    <>
      <div>{MainSocket && MainSocket.id}</div>
    <div className=" h-screen flex justify-center items-center w-full">
      <div className="absolute top-0 left-0 m-2 flex flex-col gap-2">
        <Link
          to={"/"}
          className="rounded-lg text-2xl transition-all  text-white font-bold  bg-red-600 hover:bg-red-800  p-2"
        >
          Back
        </Link>
        <Link
          to={RoomStatus == 1 ? `/InCall/${id}` : ""}
          onClick={RoomStatus !== 3 ? handlejoinrequest : undefined}
          className={`rounded-lg text-2xl transition-all text-white font-bold p-2 ${RoomStatus === 3 ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-800'}`}
        >
          {RoomStatus
            ? RoomStatus == 1
              ? "Create Room"
              : RoomStatus == 3 ? "Request sent" : "Ask to join"
            : "Checking"}
        </Link>
      </div>

      <VideoAudioJoin />
    </div>
    </>
  );
};

export default WaitingRoom;
