import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export const ChatBox = ({ MainSocket , roomid}: { MainSocket: Socket, roomid: string }) => {
    const [InputValue, SetInputValue] = useState<string>("");
    const [Messages, setMessages] = useState<{ message: string; sid: string }[]>(
      []
    );
    const handlekeypress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
      if (key === "Enter") {
 
        handlesend(InputValue);
      }
    };

    useEffect(() => {
      MainSocket.on("MessageIncoming", (MessagesUpdate) => {
        setMessages(MessagesUpdate);
      });
      MainSocket.emit('GetMessages', roomid, (MessagesUpdate:any)=>{
        setMessages(MessagesUpdate);
      })
      return () => {
        MainSocket.off("MessageIncoming");
      };
    }, [MainSocket]);

    const handlesend = (InputValue: string) => {
      MainSocket.emit("SendingMessage", InputValue, roomid);
      SetInputValue('')
    };
    return (
      <>
        <div className="m-1 h-full ">
          <p className="font-bold">Chat</p>
          <hr className="border-yellow-900" />
          {Messages.map(({ sid, message }) => {
            if (sid == MainSocket.id) {
              return (
                <div className="w-fit mr-auto bg-blue-500 text-white p-2 rounded-md my-1">
                  {message}
                </div>
              );
            } else {
              return (
                <div className="w-fit ml-auto bg-gray-300 text-black p-2 rounded-md my-1">
                  {message}
                </div>
              );
            }
          })}
        </div>
        <div className="m-1 flex relative">
          <input
            value={InputValue}
            onChange={(e) => {
              SetInputValue(e.target.value);
            }}
            onKeyDown={handlekeypress}
            type="text"
            className="border-2 border-black rounded-md p-1 w-full"
            placeholder="Message"
          />
          <button
            onClick={() => handlesend(InputValue)}
            className=" right-0 absolute p-1 h-full  bg-slate-600 text-white rounded-r-md"
          >
            Send
          </button>
        </div>
      </>
    );
  };