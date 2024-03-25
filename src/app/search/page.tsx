import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import Searchbar from "../_components/Searchbar";
import { SearchUserCard } from "../_components/SearchUserCard";

export default async function Search({
  searchParams,
}: {
  searchParams: Record<string, string> | undefined;
}) {
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (!dbUser) return null;
  if (dbUser && dbUser.onboarding) redirect(`/onboarding?id=${dbUser.id}`);
  const data = await api.profile.search.query({
    searchTerm: searchParams?.q ?? "",
  });

  return (
    <section className="p-8">
      <h1 className="mb-10">Search</h1>

      <Searchbar />

      <div className="mt-14 flex flex-col gap-9">
        {data.length === 0 ? (
          <p className="text-center">No Result</p>
        ) : (
          <>
            {data.map((user) => (
              <SearchUserCard key={user.id} {...user} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
