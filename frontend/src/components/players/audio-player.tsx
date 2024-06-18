import { Message } from "@/types/message";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { useDidUpdate } from "@mantine/hooks";
import { MouseEventHandler, ReactEventHandler, useRef, useState } from "react";
import { PiPauseFill, PiPlayFill } from "react-icons/pi";

export const AudioPlayer = ({
  message,
  chatBodySize,
}: {
  message: Message;
  chatBodySize: { width: number };
}) => {
  //
  const src = message.voiceNote
    ? buildMessageFileUrl({
        messageId: message.id,
        discussionId: message.discussionId,
        fileName: message.voiceNote.fileName,
      })
    : "";

  const [isPlaying, setIsPlaying] = useState(false);
  //
  const audioDuration = message.voiceNote?.durationInMs || 0;
  //
  const audioRef = useRef<HTMLAudioElement>(null);
  //
  //
  const handleClickOnPlayButton: MouseEventHandler<HTMLButtonElement> = (e) => {
    setIsPlaying((prevState) => !prevState);
  };
  //
  const [currentTime, setCurrentTime] = useState(0);
  //
  useDidUpdate(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const handleSeeked: ReactEventHandler<HTMLAudioElement> = () => {};
  //
  const handleEnded: ReactEventHandler<HTMLAudioElement> = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };
  //
  const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (e) => {
    setCurrentTime(e.currentTarget.currentTime * 1000);
  };

  const chooseCurrentTime: MouseEventHandler<HTMLDivElement> | undefined = (
    e
  ) => {
    if (audioRef.current) {
      const clickPositionX =
        e.clientX - e.currentTarget.getBoundingClientRect().left;
      const percentage = clickPositionX / e.currentTarget.offsetWidth;
      const currentTimeInMs = audioDuration * percentage;

      audioRef.current.currentTime = currentTimeInMs / 1000;
      setCurrentTime(currentTimeInMs);
    }
  };

  return (
    <div
      style={{
        maxWidth: `${chatBodySize.width * 0.5}px`,
      }}
      className="flex items-center pt-1.5 pl-2 pr-6"
    >
      <button onClick={handleClickOnPlayButton} className="mr-2 p-1">
        {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
      </button>
      <div className="text-xs text-gray-500 font-semibold mr-4">
        {currentTime === 0
          ? formatMilisecondsToMinutes(audioDuration)
          : formatMilisecondsToMinutes(Math.floor(audioDuration - currentTime))}
      </div>
      <div
        onClick={chooseCurrentTime}
        className="relative rounded w-48 h-2 bg-gray-300 overflow-x-hidden overflow-y-auto cursor-pointer"
      >
        <div
          style={{
            // width: isPlaying
            //   ? "100%"
            //   : `${(currentTime / audioDuration) * 100}%`,
            transform: `translateX(-${
              (1 - currentTime / audioDuration) * 100
            }%)`,
            transition: "all",
            // transitionDuration: isPlaying
            //   ? audioDuration - currentTime + "ms"
            //   : "0ms",
            // transitionDuration: audioDuration - 1000 + "ms",
            transitionTimingFunction: "linear",
          }}
          className="h-full bg-gray-700 transition-all relative"
        >
          {currentTime !== 0 && (
            <div className="absolute top-1/2 transform -translate-y-1/2 -right-1.5 rounded-full bg-white border border-gray-500 w-3 h-2"></div>
          )}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onSeeked={handleSeeked}
        controls
        className="hidden"
        preload="metadata"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      ></audio>
    </div>
  );
};
