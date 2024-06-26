"use client";
import { useSearchParams } from "next/navigation";
import { CreateComment } from "./CreateComment";
import { LoadingPage } from "./Loader";
import { EditPost } from "./EditPost";
import { SharePost } from "./SharePost";
import { EditComment } from "./EditComment";

export const Modal = () => {
  const searchParams = useSearchParams();
  const comment = searchParams.get("comment");
  const id = searchParams.get("id");
  const parentCommentId = searchParams.get("parentCommentId");
  const originalCommentId = searchParams.get("originalCommentId");
  const isComment = searchParams.get("isComment");
  const edit = searchParams.get("edit");
  const share = searchParams.get("share");
  if ((comment && !id) ?? (edit && !id) ?? (share && !id))
    return <LoadingPage />;

  return (
    <>
      {comment && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 text-slate-100 backdrop-blur">
          <CreateComment
            id={id ?? ""}
            parentCommentId={parentCommentId ?? ""}
            isComment={isComment ? true : false}
            originalCommentId={originalCommentId ?? ""}
          />
        </dialog>
      )}
      {edit && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 p-8 text-slate-100 backdrop-blur">
          <EditPost id={id ?? ""} isModal={true} />{" "}
        </dialog>
      )}
      {edit && isComment && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 p-8 text-slate-100 backdrop-blur">
          <EditComment id={id ?? ""} isModal={true} />{" "}
        </dialog>
      )}
      {share && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 p-8 text-slate-100 backdrop-blur">
          <SharePost id={id ?? ""} isModal={true} />{" "}
        </dialog>
      )}
    </>
  );
};
