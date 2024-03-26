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
    <article className="flex flex-col items-center gap-1 rounded-md px-7 py-4 sm:flex-row">
      <Image
        src={data?.profileImage ?? ""}
        alt="user_logo"
        width={20}
        height={20}
        className="rounded-full object-cover"
      />
      <span className="mr-1">{`@${data?.username}`}</span>
      <p className="text-sm">
        {props.text}
        <span className="ml-1 text-xs font-thin">{`${dayjs(
          props?.createdAt,
        ).fromNow()}`}</span>
      </p>
    </article>
  );
};
