import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import { MediapreferenceContext } from "../../../App";

const VideoDisplayCallRoom = () => {
  const [videoStream, setvideoStream] = useState<MediaStream>(); //2 means room exists, 1 means room has been created
  const { Audio_Toggle, Video_Toggle, SetVideoToggle, SetAudioToggle } =
    useContext(MediapreferenceContext);

  const videoElement = useRef<HTMLVideoElement>(null);
  const audioElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    var stream: MediaStream;
    if (Video_Toggle || Audio_Toggle) {
      navigator.mediaDevices
        .getUserMedia({ video: Video_Toggle, audio: Audio_Toggle })
        .then((userStream) => {
          stream = userStream;
          setvideoStream(stream); // Store the stream in state
          if (videoElement.current) {
            videoElement.current.srcObject = stream; // Assign the entire stream to srcObject
            videoElement.current.muted = true;
            videoElement.current.play(); // Start playing the video
          }
          if (audioElement.current) {
            audioElement.current.srcObject = stream;
            audioElement.current.muted = true;
            audioElement.current.play();
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
          if (audioElement.current) {
            audioElement.current.srcObject = null; // Reset the srcObject to null
          }
        }
      };
    }
  }, [Audio_Toggle, Video_Toggle]);

  return (
    <div className="z-50 absolute bottom-0 m-4 right-0 flex  flex-col  justify-center gap-5 items-center">
      <div className="justify-center items-center flex flex-row gap-2  h-full">
        <button
          className="p-2 w-32 bg-violet-600 transition-all rounded-md h-full text-white font-semibold  hover:bg-violet-400"
          onClick={() => SetVideoToggle(!Video_Toggle)}
        >
          {Video_Toggle ? "Disable Video" : "Enable Video"}
        </button>
        <button
          className="p-2 bg-violet-600 transition-all w-32 rounded-md h-full  text-white font-semibold  hover:bg-violet-400"
          onClick={() => SetAudioToggle(!Audio_Toggle)}
        >
          {Audio_Toggle ? "Disable Audio" : "Enable Audio"}
        </button>
      </div>
      <div className="overflow-hidden relative w-60 aspect-video  shadow-[0px_0px_5px_black] ">
      <video
              id="videoElement"
              ref={videoElement}
              className={`w-full h-full object-cover ${Video_Toggle? 'block': 'hidden'}`}
            ></video>
        {videoStream && Video_Toggle ? (
          <>
        
          </>
        ) : (
          <>
            <div className="  w-full aspect-video content-center">
              Video Disabled
            </div>
          </>
        )}
        {Audio_Toggle ? (
          <audio ref={audioElement}></audio>
        ) : (
          <div className="text-3xl mx-auto left-0 right-0 top-0 absolute text-black font-extrabold">
            Muted
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDisplayCallRoom;
