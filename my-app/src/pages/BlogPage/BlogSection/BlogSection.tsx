import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import postsData from '../../../data/posts.json';
import './BlogSection.css';
import { Post } from '../../../types/post';

const BlogSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [newPost, setNewPost] = useState<{
    title: string;
    category: string;
    date: string;
    description: string;
  }>({
    title: '',
    category: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    setPosts(postsData as Post[]);
  }, []);

  const handleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (newPost.title && newPost.category && newPost.date && newPost.description) {
      const newId = posts.length > 0
        ? Math.max(...posts.map(p => p.id)) + 1
        : 1;

      setPosts((prev) => [
        ...prev,
        {
          id: newId,
          img: 'placeholder.png',
          ...newPost,
        },
      ]);

      setNewPost({ title: '', category: '', date: '', description: '' });
    }
  };

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleEdit = (id: number, updatedPost: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updatedPost } : post))
    );
  };

  return (
    <section className="blog-section">
      <div className="blog-head">
        <h2>
          <span className="bold">our</span>
          <span className="regular10">blog</span>
        </h2>
        <button className="circle2">
          view all <br />posts
        </button>
      </div>

      <div className="blogs">
        {posts.map((post) => (
          <div
            key={post.id}
            className={selectedItems.includes(post.id) ? 'selected' : ''}
            onClick={() => handleSelect(post.id)}
          >
            <img
              src={require(`../../../images/${post.img}`)}
              alt={post.title}
            />
            <button className="post-buttons">{post.category}</button>
            <h3>{post.title}</h3>
            <p>{post.date}</p>
            <button onClick={() => setSelectedPost(post)}>View Details</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </div>
        ))}
      </div>

      <div className="add-post">
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newPost.category}
          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
        />
        <input
          type="text"
          placeholder="Date"
          value={newPost.date}
          onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newPost.description}
          onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
        />
        <button onClick={handleAdd}>Add Post</button>
      </div>

      {selectedPost && (
        <Modal
          content={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={handleEdit}
        />
      )}
    </section>
  );
};

export default BlogSection;