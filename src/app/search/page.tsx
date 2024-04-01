import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import Searchbar from "../_components/Searchbar";
import { SearchResults } from "../_components/SearchResults";

export default async function Search({
  searchParams,
}: {
  searchParams: Record<string, string> | undefined;
}) {
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (!dbUser) return null;
  if (dbUser && dbUser.onboarding) redirect(`/onboarding?id=${dbUser.id}`);

  return (
    <section className="p-8">
      <h1 className="mb-10">Search</h1>

      <Searchbar />

      <SearchResults searchTerm={searchParams?.q ?? ""} />
    </section>
  );
}
