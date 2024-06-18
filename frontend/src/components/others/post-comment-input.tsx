"use client";
import { baseFileUrl } from "@/configs";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Post } from "@/types/post";
import { getNameInitials } from "@/utils/user-utils";
import { useAtomValue } from "jotai";
import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { PiSmiley } from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { Textarea } from "../core/textarea";
import { useToast } from "../core/use-toast";
import { EmojiDropdown } from "../dropdown/emoji-dropdown/emoji-dropdown";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import { useCommentPost } from "@/hooks/use-comment-post";

//
//
//
//

export const adjustTextareaHeight = (
  postCommentTextareaRef: React.RefObject<HTMLTextAreaElement>
) => {
  if (postCommentTextareaRef.current) {
    if (postCommentTextareaRef.current.scrollHeight > 36) {
      postCommentTextareaRef.current.style.height = "38px";
      // postCommentTextareaRef.current.style.height = "auto";
      postCommentTextareaRef.current.style.height =
        postCommentTextareaRef.current.scrollHeight + "px";
    }
  }
};

//
//
//
//
//

export type PostCommentInputContext = "post-item" | "post-block";

interface PostCommentInputProps {
  post: Post;
  context: PostCommentInputContext;
  autoFocus?: boolean;
}

export const PostCommentInput = ({
  post,
  context,
  autoFocus,
}: PostCommentInputProps) => {
  const { toast } = useToast();
  const postCommentToReplyTo = useAtomValue(postCommentToReplyToAtom);

  const postCommentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [textInputCursorIndex, setTextInputCursorIndex] = useState(0);
  const maxCommentLength = 1000;

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  });

  const { commentPost, isPostCommentSending } = useCommentPost({
    post,
    postCommentTextareaRef,
    context,
  });

  const handleMouseUp: MouseEventHandler<HTMLTextAreaElement> = (e) => {
    setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleEmojiSelect = (emojiObject: any) => {
    if (postCommentTextareaRef.current) {
      postCommentTextareaRef.current.value =
        postCommentTextareaRef.current.value
          .split("")
          .toSpliced(textInputCursorIndex, 0, emojiObject.native)
          .join("");
      setTextInputCursorIndex(
        (prevState) => prevState + emojiObject.native.length
      );
      adjustTextareaHeight(postCommentTextareaRef);
    }
  };

  const handlePressEnterOnCommentInput: KeyboardEventHandler<
    HTMLTextAreaElement
  > = (e) => {
    const text = e.currentTarget.value;
    if (e.key !== "Enter") {
      return 0;
    }
    commentPost({ text });
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    adjustTextareaHeight(postCommentTextareaRef);
    if (e.target.value.length > maxCommentLength) {
      toast({
        colorScheme: "destructive",
        description: `Max length of post comment is ${maxCommentLength}`,
        duration: 1800,
      });
      e.target.value = e.target.value.slice(0, maxCommentLength);
    }
  };

  useEffect(() => {
    if (postCommentToReplyTo !== undefined) {
      postCommentTextareaRef.current?.focus();
    }
  }, [postCommentToReplyTo]);

  return (
    <div
      ref={ref}
      className={`flex h-max ${isPostCommentSending && "opacity-50"}`}
    >
      <Avatar className="w-9 h-9 mr-3">
        <AvatarImage
          alt=""
          src={
            inView
              ? loggedInUserData && loggedInUserData.user.profilePicture
                ? baseFileUrl +
                  loggedInUserData?.user.profilePicture?.lowQualityFileName
                : ""
              : ""
          }
        />
        <AvatarFallback>
          {getNameInitials(loggedInUserData?.user.displayName!)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
            <EmojiDropdown handleEmojiSelect={handleEmojiSelect}>
              <button className="h-9 text-gray-500 text-[22px]">
                <PiSmiley />
              </button>
            </EmojiDropdown>
          </div>
          <Textarea
            ref={postCommentTextareaRef}
            disabled={isPostCommentSending}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            autoFocus={autoFocus}
            className="pl-10 h-9 max-h-20 pt-[7px]"
            onKeyDown={handlePressEnterOnCommentInput}
            onChange={handleChange}
            placeholder={
              postCommentToReplyTo !== undefined
                ? `Reply to ${postCommentToReplyTo.commenter.displayName}`
                : `Enter your comment here`
            }
          ></Textarea>
        </div>
      </div>
    </div>
  );
};
