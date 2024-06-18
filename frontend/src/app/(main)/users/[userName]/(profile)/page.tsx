import UserPosts from "./_user-posts";

export async function generateMetadata({
  params,
}: {
  params: { userName: string };
}) {
  return {
    title: `@${params.userName}`,
  };
}

const UserPostsPage = () => {
  return <UserPosts />;
};

export default UserPostsPage;
