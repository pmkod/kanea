import { useAtomValue } from "jotai";
import { PiCaretDown } from "react-icons/pi";
import {
  messageToReplyToAtom,
  selectedDocsAtom,
  selectedMediasAtom,
} from "./_chat-footer";

interface GoToBottomOfChatButtonProps {
  onClick: () => void;
  unseenDiscussionMessagesCountOfThisDiscussion?: number;
}

const GoToBottomOfChatButton = ({
  unseenDiscussionMessagesCountOfThisDiscussion,
  onClick,
}: GoToBottomOfChatButtonProps) => {
  const messageToReplyTo = useAtomValue(messageToReplyToAtom);
  const selectedMedias = useAtomValue(selectedMediasAtom);
  const selectedDocs = useAtomValue(selectedDocsAtom);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer hover:bg-gray-100 transition-colors fixed right-8 z-40 rounded-full bg-white p-2 border border-gray-200 shadow-md`}
      style={{
        bottom:
          96 +
          (messageToReplyTo !== undefined &&
          (selectedMedias.length > 0 || selectedDocs.length > 0)
            ? 160
            : selectedMedias.length > 0 || selectedDocs.length > 0
            ? 100
            : messageToReplyTo !== undefined
            ? 54
            : 0) +
          "px",
      }}
    >
      {unseenDiscussionMessagesCountOfThisDiscussion !== undefined &&
        unseenDiscussionMessagesCountOfThisDiscussion > 0 && (
          <div className="absolute -right-1 -top-1 bg-green-500 rounded-full text-white text-sm w-5 h-5 flex justify-center items-center font-semibold">
            {unseenDiscussionMessagesCountOfThisDiscussion}
          </div>
        )}
      <div className="text-xl">
        <PiCaretDown />
      </div>
    </div>
  );
};

export default GoToBottomOfChatButton;
