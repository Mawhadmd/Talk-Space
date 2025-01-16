import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import { MediapreferenceContext } from "../../../App";

const VideoAudioJoin = () => {
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
          console.log(stream, Video_Toggle, Audio_Toggle);
          console.log(videoElement,audioElement)
          if (videoElement.current) {
            videoElement.current.srcObject = stream; // Assign the entire stream to srcObject
            videoElement.current.onloadedmetadata = function () {
              if (videoElement.current) {
                videoElement.current.muted = true;
                videoElement.current.play();
              }
            };
          }
          if (audioElement.current) {
            audioElement.current.srcObject = stream;
            audioElement.current.muted = true;
            audioElement.current.play();
          }
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });

      return () => {
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          if (videoElement.current) {
            videoElement.current.srcObject = null;
          }
          if (audioElement.current) {
            audioElement.current.srcObject = null;
          }
        }
      };
    }
  }, [Audio_Toggle, Video_Toggle, videoElement, audioElement]);

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
      </div>
      <div className="overflow-hidden relative w-full aspect-video  shadow-[0px_0px_5px_black] ">
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

export default VideoAudioJoin;
