import PostsPagination from '@/components/posts/PostPagination';
import PostsTable from '@/components/posts/PostsTable';
import BackButton from '@/components/ui/backbutton';


const PostsPage = () => {
  return (
    <>
      <BackButton text='Go Back' link='/' />
      <PostsTable />
      <PostsPagination />
    </>
  );
};

export default PostsPage;