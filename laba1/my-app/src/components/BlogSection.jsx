import './BlogSection.css';
import blogImg1 from '../images/blog_img1.png';
import blogImg2 from '../images/blog_img2.png';
import blogImg3 from '../images/blog_img3.png';

function BlogSection() {
  const posts = [
    {
      img: blogImg1,
      category: 'marketing',
      title: 'Curating a workplace that inspires all of us',
      date: 'February 3, 2021',
    },
    {
      img: blogImg2,
      category: 'design',
      title: 'Designers who changed the web with Webflow',
      date: 'February 25, 2021',
    },
    {
      img: blogImg3,
      category: 'code',
      title: 'Communication between studio departments',
      date: 'March 9, 2021',
    },
  ];

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
        {posts.map((post, index) => (
          <div key={index}>
            <img src={post.img} alt="blog" />
            <button className="post-buttons">{post.category}</button>
            <h3>{post.title}</h3>
            <p>{post.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BlogSection;