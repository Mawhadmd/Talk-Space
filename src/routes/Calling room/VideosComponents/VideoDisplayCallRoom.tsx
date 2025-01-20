import { useContext, useRef } from "react";
import { useEffect } from "react";
import { MediapreferenceContext } from "../../../App";

const VideoDisplayCallRoom = ({localStream}:{localStream: MediaStream | undefined}) => {

  const { Audio_Toggle, Video_Toggle, SetVideoToggle, SetAudioToggle } =
    useContext(MediapreferenceContext);

  const videoElement = useRef<HTMLVideoElement>(null);
  const audioElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if(!localStream) return
    if (Video_Toggle || Audio_Toggle) {
   
          if (videoElement.current) {
            videoElement.current.srcObject = localStream; // Assign the entire stream to srcObject
            videoElement.current.muted = true;
            videoElement.current.play(); // Start playing the video
          }
          if (audioElement.current) {
            audioElement.current.srcObject = localStream;
            audioElement.current.muted = true;
            audioElement.current.play();
          }
          console.log(localStream);
  

      // Cleanup function to stop the media tracks when the component unmounts or dependencies change
      return () => {


    if (videoElement.current) {
      videoElement.current.srcObject = null; // Reset the srcObject to null
    }
    if (audioElement.current) {
      audioElement.current.srcObject = null; // Reset the srcObject to null
    }

      };
    }
  }, [localStream]);

  return (
    <div className="h-52 flex  flex-col  justify-center gap-5 items-center">
      <div className="justify-center items-center flex flex-row gap-2  ">
        <button
          className="p-2 w-32 whitespace-nowrap  h-10 bg-violet-600 transition-all rounded-md text-white font-semibold  hover:bg-violet-400"
          onClick={() => SetVideoToggle(!Video_Toggle)}
        >
          {Video_Toggle ? "Disable Video" : "Enable Video"}
        </button>
        <button
          className="p-2 h-10 whitespace-nowrap bg-violet-600 transition-all w-32 rounded-md  text-white font-semibold  hover:bg-violet-400"
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
        {localStream?.getVideoTracks().length && Video_Toggle ? (
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
