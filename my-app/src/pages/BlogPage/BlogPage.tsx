import React from 'react';
import BlogSection from './BlogSection/BlogSection';
import ContactSection from './ContactSection/ContactSection';

const BlogPage: React.FC = () => {
  return (
    <div>
      <BlogSection />
      <ContactSection />
    </div>
  );
};

export default BlogPage;