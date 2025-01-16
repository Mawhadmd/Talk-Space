import { useState } from "react";
import image from "../../assets/Backgroundforzoomapp.png";
import { Outlet, useNavigate, useOutlet } from "react-router-dom";

import NavBar from "../../NavBar";
import LiveMouse from "../../utils/LiveMouse";


const Hero = ({showAlert}:{showAlert: (message:string)=>void}) => {

  const [roomid, setRoomid] = useState("");


  let thereoutlet = useOutlet();
  const navigate = useNavigate();

  const Generatenewroomid = () => {
    let roomId = Math.random().toString(36).substring(7);
    while (roomId.length < 6) {
      roomId = Math.random().toString(36).substring(7);
    }
    setRoomid(roomId);
  };

  const Setnewroomid = async () => {
    if (roomid.length < 6) {
      showAlert("Room id is not valid");
      return;
    } else {
      showAlert("Now Creating/Joining the room");
      setTimeout(() => {
        navigate(`/GettingReady/${roomid}`);
      }, 500);
      
    }
  };
  const hascurser = () =>
    document.body.clientWidth > 500 ||
    window.matchMedia("(pointer:fine)").matches;
  return (
    <>
         {hascurser() ? <LiveMouse /> : ""}
      <NavBar />
      <div
        id="Hero"
        className="w-screen max-h-screen  text-black   h-screen flex justify-around items-center "
      >
        {!thereoutlet ? (
          <>
            <div className="lg:ml-10 content-center">
              <div className=" text-5xl font-bold">
                Tired of Niggers? <br></br>Call 911
              </div>
              <div>
                Generate a new code or write existing one to{" "}
                <span className="font-bold bg-red-100 text-black p-1 rounded-full">
                  join a video/audio room
                </span>
                <br />
                <div>
                  What are you waiting for
                  <br />
                  <br />
                  <input
                    value={roomid}
                    onChange={(e) => setRoomid(e.target.value)}
                    type="text"
                    placeholder="Room id"
                    className="placeholder:text-center bg-black placeholder:font-bold text-white rounded-xl w-72 h-10 p-1 "
                  />
                  <br />
                  <div className="flex justify-center">
                    <button
                      onClick={Setnewroomid}
                      className="mt-1 h-10 bg-black hover:bg-red-800  transition-all ml-1 border-none text-white p-1"
                    >
                      Enter Room
                    </button>

                    <button
                      onClick={Generatenewroomid}
                      className="mt-1 h-10 bg-black hover:bg-red-800  transition-all ml-1 border-none text-white p-1"
                    >
                      Generate a new code
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:block hidden content-center">
              <img src={image} className="max-h-[500px]" alt="" />
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
};

export default Hero;
