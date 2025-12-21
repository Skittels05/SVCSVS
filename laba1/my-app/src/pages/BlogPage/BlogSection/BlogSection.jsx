import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Title, Card, Button } from '../../../components/ui';
import Modal from '../../../components/Modal/Modal';
import postsData from '../../../data/posts.json';

const Section = styled.section`
  margin-top: 15.5rem;
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

const OurBold = styled.span`
  font-size: 6rem;
  font-weight: bold;
`;

const BlogRegular = styled.span`
  font-size: 5.7rem;
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

const StyledPostCard = styled(Card)`
  cursor: pointer;
  background-color: ${props => props.$selected ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  transition: background-color 0.3s;
  opacity: 1 !important;

  img {
    width: 373px;
    height: auto;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

const CategoryTag = styled.div`
  margin-top: 4.5rem;
  align-self: center;
  padding: 0 1.5rem;
  height: 34px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;

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
  color: ${props => props.theme.colors.primary};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PostDate = styled.p`
  font-size: 1.7rem;
  color: ${props => props.theme.colors.primary};
`;

const ActionWrapper = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
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
`;

const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', category: '', date: '', description: '' });

  useEffect(() => setPosts(postsData), []);

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
    <Container>
      <Section>
        <Head>
          <Title>
            <OurBold>our</OurBold> <BlogRegular>blog</BlogRegular>
          </Title>
          <Button $round>
            view all <br />posts
          </Button>
        </Head>

        <BlogsGrid>
          {posts.map((post) => (
            <StyledPostCard
              key={post.id}
              $selected={selectedItems.includes(post.id)}
              onClick={() => handleSelect(post.id)}
            >
              <img src={require(`../../../images/${post.img}`)} alt={post.title} />
              <CategoryTag>{post.category}</CategoryTag>
              <PostTitle>{post.title}</PostTitle>
              <PostDate>{post.date}</PostDate>
              <ActionWrapper>
                <Button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}>
                  View Details
                </Button>
                <Button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                  Delete
                </Button>
              </ActionWrapper>
            </StyledPostCard>
          ))}
        </BlogsGrid>

        <AddPostForm>
          <input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
          <input type="text" placeholder="Category" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} />
          <input type="text" placeholder="Date" value={newPost.date} onChange={(e) => setNewPost({ ...newPost, date: e.target.value })} />
          <input type="text" placeholder="Description" value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })} />
          <Button $large onClick={handleAdd}>Add Post</Button>
        </AddPostForm>

        {selectedPost && (
          <Modal content={selectedPost} onClose={() => setSelectedPost(null)} onEdit={handleEdit} />
        )}
      </Section>
    </Container>
  );
};

export default BlogSection;