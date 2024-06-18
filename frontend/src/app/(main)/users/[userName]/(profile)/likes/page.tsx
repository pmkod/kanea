import UserLikes from "./_user-likes";

export async function generateMetadata({
  params,
}: {
  params: { userName: string };
}) {
  return {
    title: `@${params.userName} likes`,
  };
}

const UserLikesPage = () => {
  return <UserLikes />;
};

export default UserLikesPage;
