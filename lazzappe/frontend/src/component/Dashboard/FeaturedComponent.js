import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboard/FeaturedComponent.css';
 
export default function FeaturedComponent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const navigate = useNavigate();
 
  const slides = [
    {
      id: 1,
      title: 'COMFY AT HOME',
      date: 'JUL 8',
      badge: '#LazzappeeNewNormal',
      image:
        'https://vader-prod.s3.amazonaws.com/1704736133-81eVfaCd5zL.jpg',
      discount: 'UP TO 50% OFF'
    },
    {
      id: 2,
      title: 'SUMMER SALE',
      date: 'JUL 15',
      badge: '#SummerDeal',
      image: 'https://image.made-in-china.com/318f0j00yEURFhrWvopf/-824057-1-mp4.webp',
      discount: 'UP TO 60% OFF'
    },
    {
      id: 3,
      title: 'FLASH DEALS',
      date: 'JUL 22',
      badge: '#FlashSale',
      image:
        'https://novaedgethreads.com/cdn/shop/files/Baklaback-view-oversized-tee-mockup-of-a-man-sitting-on-a-customizable-cube-m38922.png?v=1726961585%27',
      discount: 'UP TO 40% OFF'
    },
    {
      id: 4,
      title: 'URBAN ESSENTIALS',
      date: 'AUG 12',
      badge: '#StreetStyle',
      image: 'https://i5.walmartimages.com/seo/CoCopeaunts-new-Embroidered-Messenger-Bags-Women-Leather-Handbags-Hand-Bags-for-Women-Sac-a-Main-Ladies-Hand-Bag-Female-bag-sac-femme_934c9131-d115-4666-b416-8655d70b1198.4e27af0d08f935fc1148430cec95659a.jpeg',
      discount: 'UP TO 25% OFF'
    },
    {
      id: 5,
      title: 'MINIMALIST PICKS',
      date: 'AUG 18',
      badge: '#FreshFit',
      image: 'https://packmojo.com/blog/images/2021/06/weekly-favorites-minimalist-skincare-packaging-designs.jpg',
      discount: 'STARTING AT ₱299'
    },
    {
      id: 6,
      title: 'WORKOUT WEAR',
      date: 'AUG 25',
      badge: '#ActiveFit',
      image: 'https://media.istockphoto.com/id/466367844/photo/clothes-make-running.jpg?s=612x612&w=0&k=20&c=eGOSP7X2MoXpGKhv8a3UlYHplvKvIIdUPmVKBSd3bMI=',
      discount: 'UP TO 35% OFF'
    }
  ];
 
  const nextSlide = () => {
    setPrevSlide(currentSlide);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
 
  const prevSlideAction = () => {
    setPrevSlide(currentSlide);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
 
  const goToSlide = (index) => {
    setPrevSlide(currentSlide);
    setCurrentSlide(index);
  };
 
  // auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        setPrevSlide(prev);
        return (prev + 1) % slides.length;
      });
    }, 5000);
 
    return () => clearInterval(interval);
  }, [slides.length]);
 
  return (
    <div className="hero-banner">
      <div className="hero-container">
        <div className="slider-wrapper">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((s, index) => {
              const classes = ['slide'];
              if (index === currentSlide) classes.push('active');
              if (index === prevSlide) classes.push('exit');
              return (
                <div className={classes.join(' ')} key={s.id}>
                  <div className="hero-content">
                    <span className="hero-badge">{s.badge}</span>
                    <h1 className="hero-title">{s.title}</h1>
                    <p className="hero-date">{s.date}</p>
                  </div>
 
                  <div className="hero-image-section">
                    <img src={s.image} alt={s.title} className="hero-image" />
                  </div>
 
                  <div className="hero-discount">
                    <div className="discount-circle">
                      <p className="discount-text">{s.discount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Navigation Buttons */}
        <button className="hero-nav-btn hero-prev" onClick={prevSlideAction}>
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
        <div className="hero-right-item hero-right-bottom" onClick={() => navigate('/products')} style={{cursor:'pointer'}}>
          <h3>LAZZAPPEE Products</h3>
          <div className="games-icons">
            <span>🛍️</span>
            <span>🛒</span>
            <span>🏷️</span>
          </div>
        </div>
      </div>
    </div>
  );
}