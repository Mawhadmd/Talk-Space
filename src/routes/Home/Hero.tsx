import { useState } from "react";
import image from "../../assets/Backgroundforzoomapp.png";
import { Outlet, useNavigate, useOutlet } from "react-router-dom";

import NavBar from "../../NavBar";
import LiveMouse from "../../utils/LiveMouse";

const Hero = ({ showAlert }: { showAlert: (message: string) => void }) => {
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
        className="w-screen max-h-screen    h-screen flex justify-center items-center mx-auto bg-cover bg-no-repeat bg-center relative"
      >
        {!thereoutlet ? (
          <>
            <div className="lg:ml-10 bg-gradient-to-br from-black via-gray-900 to-red-900 bg-opacity-80 rounded-3xl p-10 h-fit flex flex-col items-center lg:items-start w-full max-w-lg justify-center shadow-2xl border-4 border-yellow-400">
              <span
                className="text-3xl font-bold bebas-neue-regular text-yellow-400 mb-4 lg:text-5xl text-center lg:text-left drop-shadow"
                style={{ WebkitTextStroke: "1px #000" }}
              >
                Connect, Collaborate, and Communicate Instantly
              </span>
              <div className="text-lg mb-6 text-neutral-100 text-center lg:text-left font-medium">
                Enter a room code to join your friends, or generate a new one to
                start your own private video/audio call.
              </div>
              <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-md border-2 border-yellow-400">
                <div className="text-base font-semibold mb-2 text-gray-700">
                  Ready to get started?
                </div>
                <input
                  value={roomid}
                  onChange={(e) => setRoomid(e.target.value)}
                  type="text"
                  placeholder="Enter or generate a Room ID"
                  className="placeholder:text-center bg-black/80 placeholder:font-bold text-yellow-300 rounded-xl w-72 h-12 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-lg border border-yellow-400"
                />
                <div className="flex w-full justify-center gap-3">
                  <button
                    onClick={Setnewroomid}
                    className="h-12 px-6 bg-gradient-to-r from-red-700 to-yellow-400 hover:from-red-800 hover:to-yellow-500 transition-all border-none text-white font-bold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={Generatenewroomid}
                    className="h-12 px-6 bg-gradient-to-r from-yellow-400 to-red-400 hover:from-yellow-500 hover:to-red-500 transition-all border-none text-white font-bold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Generate Code
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="sm:block hidden content-center">
              <img src={image} className="max-h-[500px]" alt="" />
            </div> */}
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
};

export default Hero;
