import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../../../components/Modal/Modal';
import postsData from '../../../data/posts.json';

const Section = styled.section`
  margin-top: 15.5rem;
  text-align: center;

  @media (max-width: 320px) {
    text-align: center;
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 12rem;
  text-transform: uppercase;

  @media (max-width: 768px) {
    padding-bottom: 5rem;
  }

  @media (max-width: 320px) {
    flex-direction: column;
    margin: 0 auto;
    gap: 3rem;
  }
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
`;

const Bold = styled.span`
  font-size: 6rem;
  font-weight: bold;
`;

const Regular = styled.span`
  font-weight: normal;
  font-size: 5.7rem;
  letter-spacing: 1px;
  margin-left: 2rem;
`;

const ViewAllButton = styled.button`
  width: 14rem;
  height: 14rem;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 2rem;
  letter-spacing: 0.1rem;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.5;
  }
`;

const BlogsGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-top: 5.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 10rem;
  }
`;

const PostCard = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background-color 0.3s;

  &.selected {
    background-color: rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    width: 70vw;
    margin: 0 auto;
  }

  img {
    width: 373px;
    height: auto;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

const CategoryButton = styled.button`
  margin-top: 4.5rem;
  width: fit-content;
  padding: 0 1.5rem;
  height: 34px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: default;
  align-self: center;

  &:hover {
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const PostTitle = styled.h3`
  margin: 2rem 0 3rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 2.6rem;
  width: 37.3rem;
  color: ${props => props.theme.colors.primary};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PostDate = styled.p`
  font-size: 1.7rem;
  color: ${props => props.theme.colors.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1.4rem;
  text-transform: uppercase;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
`;

const AddPostForm = styled.div`
  margin-top: 4rem;
  text-align: center;

  input {
    margin: 0 1rem;
    padding: 0.8rem;
    font-size: 1.6rem;
    width: 200px;
    border: 1px solid ${props => props.theme.colors.primary};
    border-radius: 5px;

    @media (max-width: 768px) {
      display: block;
      width: 80%;
      margin: 1rem auto;
    }
  }

  button {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    font-size: 1.6rem;
    text-transform: uppercase;
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.7;
    }
  }
`;

const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', category: '', date: '', description: '' });

  useEffect(() => {
    setPosts(postsData);
  }, []);

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (newPost.title && newPost.category && newPost.date && newPost.description) {
      setPosts((prev) => [
        ...prev,
        { id: Date.now(), img: 'placeholder.png', ...newPost },
      ]);
      setNewPost({ title: '', category: '', date: '', description: '' });
    }
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleEdit = (id, updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updatedPost } : post))
    );
    setSelectedPost(null);
  };

  return (
    <Section>
      <Head>
        <Title>
          <Bold>our</Bold> <Regular>blog</Regular>
        </Title>
        <ViewAllButton>
          view all <br />posts
        </ViewAllButton>
      </Head>

      <BlogsGrid>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            className={selectedItems.includes(post.id) ? 'selected' : ''}
            onClick={() => handleSelect(post.id)}
          >
            <img src={require(`../../../images/${post.img}`)} alt={post.title} />
            <CategoryButton>{post.category}</CategoryButton>
            <PostTitle>{post.title}</PostTitle>
            <PostDate>{post.date}</PostDate>
            <ActionButtons>
              <ActionButton onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}>
                View Details
              </ActionButton>
              <ActionButton onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                Delete
              </ActionButton>
            </ActionButtons>
          </PostCard>
        ))}
      </BlogsGrid>

      <AddPostForm>
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
      </AddPostForm>

      {selectedPost && (
        <Modal
          content={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={handleEdit}
        />
      )}
    </Section>
  );
};

export default BlogSection;