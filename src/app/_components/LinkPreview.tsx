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
      className="flex  h-[160px] cursor-pointer items-center gap-3 border-[2px]  bg-slate-800 text-left"
      style={{
        textDecoration: "none",
      }}
    >
      <div className="h-full object-cover">
        <img
          src={data.image}
          alt="Link Preview"
          className="m-0 h-full object-cover"
        />
      </div>
      <div className="w-[60%] p-4">
        <h3 className="mb-2 text-sm font-bold">{data.title}</h3>
        <p className="mb-2  line-clamp-3 text-sm ">{data.description}</p>
      </div>
    </Link>
  );
}
