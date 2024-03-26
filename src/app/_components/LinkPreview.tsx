import Link from "next/link";
import { api } from "~/trpc/react";

export default function LinkPreview(params: { url: string }) {
  const { data } = api.post.getLinkData.useQuery({ link: params.url });

  if (!data) {
    return <p>Failed to fetch link preview.</p>;
  }
  return (
    <Link
      href={params.url}
      target="_blank"
      className="flex  h-[160px] cursor-pointer items-center gap-1 border-[2px] bg-slate-800  text-left sm:gap-3"
      style={{
        textDecoration: "none",
      }}
    >
      <div className="h-full w-[50%] object-cover sm:w-[40%]">
        <img
          src={data.image}
          alt="Link Preview"
          className="m-0 h-full object-cover"
        />
      </div>
      <div className="w-[60%] overflow-hidden p-4 sm:w-[60%]">
        <h3 className="mb-2 text-xs leading-3 sm:text-sm sm:font-bold">
          {data.title}
        </h3>
      </div>
    </Link>
  );
}
