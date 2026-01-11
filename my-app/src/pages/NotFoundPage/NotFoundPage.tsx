import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import placeholder from '../../images/placeholder.png';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);

  return (
    <section className="not-found-section">
      <h1 className="not-found-title">
        <span className="bold">404</span>
        <span className="regular">Not Found</span>
      </h1>

      <p className="not-found-message">
        Oops! The page you're looking for doesn't exist.
      </p>

      <img
        src={placeholder}
        alt="404 - страница не найдена"
        className="not-found-image"
        onError={(e) => {
          e.currentTarget.src = placeholder;
        }}
      />

      <Link
        to="/"
        className={`not-found-button ${isButtonHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        Back to Home
      </Link>
    </section>
  );
};

export default NotFoundPage;