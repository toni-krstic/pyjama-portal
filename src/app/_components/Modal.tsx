"use client";
import { useSearchParams } from "next/navigation";
import { CreateComment } from "./CreateComment";
import { LoadingPage } from "./Loader";
import { EditPost } from "./EditPost";

export const Modal = () => {
  const searchParams = useSearchParams();
  const comment = searchParams.get("comment");
  const id = searchParams.get("id");
  const parentCommentId = searchParams.get("parentCommentId");
  const isComment = searchParams.get("isComment");
  const edit = searchParams.get("edit");

  if ((comment && !id) ?? (edit && !id)) return <LoadingPage />;

  return (
    <>
      {comment && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 text-slate-100 backdrop-blur">
          <CreateComment
            id={id ?? ""}
            parentCommentId={parentCommentId ?? ""}
            isComment={isComment ? true : false}
          />
        </dialog>
      )}
      {edit && (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-black bg-opacity-50 p-8 text-slate-100 backdrop-blur">
          <EditPost id={id ?? ""} isModal={true} />{" "}
        </dialog>
      )}
    </>
  );
};
