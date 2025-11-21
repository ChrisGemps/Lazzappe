import React, { useState } from 'react';
import '../../css/Dashboard/FeaturedComponent.css';

export default function FeaturedComponent() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'COMFY AT HOME',
      date: 'JUL 8',
      badge: '#LazzappeeNewNormal',
      image: 'https://i.pcmag.com/imagery/roundups/02naaOkVLe7DIiejFUyDPJp-64..v1734989633.jpg',
      discount: 'UP TO 50% OFF'
    },
    {
      id: 2,
      title: 'SUMMER SALE',
      date: 'JUL 15',
      badge: '#SummerDeal',
      image: 'https://via.placeholder.com/400x300',
      discount: 'UP TO 60% OFF'
    },
    {
      id: 3,
      title: 'FLASH DEALS',
      date: 'JUL 22',
      badge: '#FlashSale',
      image: 'https://via.placeholder.com/400x300',
      discount: 'UP TO 40% OFF'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div className="hero-banner">
      <div className="hero-container">
        {/* Left Section - Text Content */}
        <div className="hero-content">
          <span className="hero-badge">{slide.badge}</span>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-date">{slide.date}</p>
        </div>

        {/* Center Section - Image */}
        <div className="hero-image-section">
          <img src={slide.image} alt={slide.title} className="hero-image" />
        </div>

        {/* Right Section - Discount */}
        <div className="hero-discount">
          <div className="discount-circle">
            <p className="discount-text">{slide.discount}</p>
          </div>
        </div>


          {/* Navigation Buttons */}
        <button className="hero-nav-btn hero-prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="hero-nav-btn hero-next" onClick={nextSlide}>
          ❯
        </button>

        {/* Dots Indicator */}
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

      </div>

      

      

      {/* Right Banner Section */}
      <div className="hero-right-section">
        <div className="hero-right-item hero-right-top">
          <span className="right-badge">#LazzappeeNewNormal</span>
          <h3>LazzappeePay</h3>
          <p>SAVE UP TO ₱400</p>
        </div>
        <div className="hero-right-item hero-right-bottom">
          <h3>LAZZAPPEE GAMES</h3>
          <div className="games-icons">
            <span>🎮</span>
            <span>🍭</span>
            <span>🎣</span>
          </div>
        </div>
      </div>
    </div>
  );
}