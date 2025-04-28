import { useState } from 'react';
import { Post } from '@/types/posts';
import postsData from '@/data/posts'; 

const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>(postsData); 

  const updatePost = (id: string, newData: Post) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === id ? { ...post, ...newData } : post
      )
    );
  };

  return { posts, updatePost };
};

export default usePosts;
