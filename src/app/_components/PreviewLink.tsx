import Link from "next/link";
import ReactPlayer from "react-player";
import { api } from "~/trpc/react";

export const PreviewLink = (props: { link: string }) => {
  const { link } = props;

  const { data } = api.post.getLinkData.useQuery({ link });

  if (!data) return null;

  const player =
    data.mediaType === "video.other" ??
    data.mediaType === "video" ??
    data.mediaType === "audio" ??
    data.mediaType === "music.playlist";

  return (
    <>
      {data && player ? (
        <ReactPlayer url={data.url} width={400} height={300} />
      ) : (
        <>
          <Link href={data.url} target="_blank">
            <img
              src={data.favicons[0] ?? ""}
              alt="link"
              width={50}
              height={50}
            />
          </Link>
        </>
      )}
    </>
  );
};