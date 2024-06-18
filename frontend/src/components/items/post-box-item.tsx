import { baseFileUrl } from "@/configs";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { Post } from "@/types/post";
import Link from "next/link";
import { PiVideoFill } from "react-icons/pi";
import {
  RiChat1Fill,
  RiCheckboxMultipleBlankFill,
  RiHeart3Fill,
} from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "../core/skeleton";
import { formatStatNumber } from "@/utils/number-utils";

interface PostBoxItemProps {
  post: Post;
  showTopRightIndicator?: boolean;
  showStat?: boolean;
}

export const PostBoxItem = ({
  post,
  showTopRightIndicator,
  showStat,
}: PostBoxItemProps) => {
  //
  const { ref, inView, entry } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "200px",
    initialInView: true,
  });
  //
  return post === null || post === undefined ? (
    <div className="w-full h-full bg-gray-800 opacity-40 flex justify-center items-center text-sm leading-none text-center text-gray-200">
      Post <br /> deleted
    </div>
  ) : (
    <Link
      href={`/posts/${post.id}`}
      ref={ref}
      className="relative aspect-square cursor-pointer group rounded-none"
    >
      {showTopRightIndicator === true && (
        <div className="absolute z-40 top-4 right-4">
          <div className="drop-shadow">
            <div className="drop-shadow">
              <div className="text-[#ffffff] text-2xl drop-shadow">
                {post.medias[0].mimetype.startsWith("video") ? (
                  <PiVideoFill />
                ) : post.medias.length > 1 ? (
                  <RiCheckboxMultipleBlankFill />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      {showStat && (
        <div className="absolute z-40 text-xl text-[#ffffff] top-1/2 transform -translate-y-1/2 w-full hidden group-hover:flex justify-evenly">
          <div className="flex flex-col items-center">
            <RiHeart3Fill />

            <div>{formatStatNumber(post.likesCount)}</div>
          </div>

          <div className="flex flex-col items-center">
            <RiChat1Fill />
            <div>{post.commentsCount}</div>
          </div>
        </div>
      )}
      <div className="w-full h-full absolute z-30  group-hover:bg-[#000000] group-hover:opacity-50 transition-colors"></div>
      {acceptedImageMimetypes.includes(post.medias[0].mimetype) ? (
        <img
          src={inView ? baseFileUrl + post.medias[0].mediumQualityFileName : ""}
          alt=""
          className="w-full h-full object-cover bg-gray-100"
        />
      ) : acceptedVideoMimetypes.includes(post.medias[0].mimetype) ? (
        <video
          className="w-full h-full object-cover bg-gray-100"
          src={inView ? baseFileUrl + post.medias[0].bestQualityFileName : ""}
          disablePictureInPicture
        ></video>
      ) : null}
    </Link>
  );
};

export const PostBoxItemLoader = () => {
  return <Skeleton className="aspect-square rounded-none" />;
};
