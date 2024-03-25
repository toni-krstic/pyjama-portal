import Link from "next/link";
import { api } from "~/trpc/react";

export default function LinkPreview(params: { url: string }) {
  //here calling the function
  const { data } = api.post.getLinkData.useQuery({ link: params.url });

  if (!data) {
    return <p>Failed to fetch link preview.</p>;
  }
  return (
    <Link
      href={params.url}
      target="_blank"
      className="flex  h-[200px] w-[50%] cursor-pointer items-center gap-1 border-[2px] border-white bg-[#f3f3f3] text-left"
      style={{
        textDecoration: "none",
      }}
    >
      <div className="object-cover">
        <img
          src={data.image}
          alt="Link Preview"
          className="m-0 h-full w-[340px] object-cover"
        />
      </div>
      <div className="w-[60%] p-4">
        <h3 className="mb-2 font-bold leading-[2rem] ">{data.title}</h3>
        <p className="mb-2  line-clamp-3 text-base ">{data.description}</p>
        <span className="mt-3 text-xs opacity-50">&nbsp;{params.url}</span>
      </div>
    </Link>
  );
}
