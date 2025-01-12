import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import cliensocket from "socket.io-client";

const VideoAudioJoin = ({
  showAlert,
}: {
  showAlert: (message: string) => void;
}) => {
  const [videoStream, setvideoStream] = useState<MediaStream>(); //2 means room exists, 1 means room has been created
  const [RoomStatus, setRoomStatus] = useState<number>();
  const [Video_Toggle, SetVideoToggle] = useState<boolean>();
  const [Audio_Toggle, SetAudioToggle] = useState<boolean>();
  const videoElement = useRef<HTMLVideoElement>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    let t = false;

    const newSocket = cliensocket("http://localhost:3000");
    console.log("connected");
    newSocket
      .timeout(2000)
      .emit(
        "RoomCreation",
        id,
        (err: Error | null, response: string, responseid: number) => {
          if (t) return;

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
      newSocket.disconnect();
    };
  }, [id]);
  useEffect(() => {
    var stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({ video: Video_Toggle, audio: Audio_Toggle })
      .then((userStream) => {
        stream = userStream;
        setvideoStream(stream); // Store the stream in state
        if (videoElement.current) {
          videoElement.current.srcObject = stream; // Assign the entire stream to srcObject
          // videoElement.current.muted = true;
          videoElement.current.play(); // Start playing the video
        }
        console.log(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    // Cleanup function to stop the media tracks when the component unmounts or dependencies change
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop()); // Stop each track
        if (videoElement.current) {
          videoElement.current.srcObject = null; // Reset the srcObject to null
        }
      }
    };
  }, [Audio_Toggle, Video_Toggle]);

  return (
    <div className="w-[80%]  flex  flex-col lg:flex-row justify-center gap-5 items-center">
      <div className="justify-center items-center flex flex-row gap-2 lg:flex-col  h-full">
        <button
          className="p-2 bg-violet-600 transition-all rounded-md h-full w-fit hover:bg-violet-400"
          onClick={() => SetVideoToggle(!Video_Toggle)}
        >
          {Video_Toggle ? "Disable Video" : "Enable Video"}
        </button>
        <button
          className="p-2 bg-violet-600 transition-all rounded-md h-full w-fit hover:bg-violet-400"
          onClick={() => SetAudioToggle(!Audio_Toggle)}
        >
          {Audio_Toggle ? "Disable Audio" : "Enable Audio"}
        </button>

        <button className="p-2 h-full w-fit transition-all items-center hover:shadow-lg hover:bg-green-600 bg-green-500 rounded-md  ">
          {RoomStatus
            ? RoomStatus == 1
              ? "Get in"
              : "Ask to join"
            : "Checking"}
        </button>
      </div>
      <div className="overflow-hidden relative w-full aspect-video  shadow-[0px_0px_5px_black] ">
        {videoStream && Video_Toggle ? (
          <>
            <video
              id="videoElement"
              ref={videoElement}
              className="w-full h-full object-cover"
            ></video>
          </>
        ) : (
          <>
            {Audio_Toggle && <audio ref={videoElement}></audio>}
            <div className="  w-full aspect-video content-center">
              Video Disabled
            </div>
          </>
        )}

        {Audio_Toggle ?? (
          <div className="text-3xl mx-auto left-0 right-0 top-0 absolute text-black font-extrabold">
            Muted
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAudioJoin;
