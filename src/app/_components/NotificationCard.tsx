import Image from "next/image";
import { api } from "~/trpc/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const NotificationCard = async (props: {
  id: string;
  text: string;
  createdAt: Date;
}) => {
  const data = await api.profile.getUserById.query({ id: props.id });
  return (
    <article className="flex items-center gap-2 rounded-md px-7 py-4">
      <Image
        src={data?.profileImage ?? ""}
        alt="user_logo"
        width={20}
        height={20}
        className="rounded-full object-cover"
      />
      <p className="">
        <span className="mr-1">{`@${data?.username}`}</span> {props.text}
        <span className="ml-2 text-xs font-thin">{`${dayjs(
          props?.createdAt,
        ).fromNow()}`}</span>
      </p>
    </article>
  );
};
