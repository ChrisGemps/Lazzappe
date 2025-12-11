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
      date: 'DEC 12',
      badge: '#LazzappeeNewNormal',
      image: 'https://cdn.shopify.com/s/files/1/0777/8195/8992/files/bentley-home-ashford-sofa.jpg?v=1744795298&width=3840',
      discount: 'UP TO 50% OFF',
      category: 'Home Furnitures',
    },
    {
      id: 2,
      title: 'SUMMER SALE',
      date: 'NOV 30',
      badge: '#SummerDeal',
      image: 'https://image.made-in-china.com/318f0j00yEURFhrWvopf/-824057-1-mp4.webp',
      discount: 'UP TO 60% OFF',
      category: "Women's Apparel",
    },
    {
      id: 3,
      title: 'FLASH DEALS',
      date: 'DEC 02',
      badge: '#FlashSale',
      image: 'https://novaedgethreads.com/cdn/shop/files/Baklaback-view-oversized-tee-mockup-of-a-man-sitting-on-a-customizable-cube-m38922.png?v=1726961585%27',
      discount: 'UP TO 40% OFF',
      category: "Men's Apparel",
    },
    {
      id: 4,
      title: 'URBAN ESSENTIALS',
      date: 'NOV 12',
      badge: '#StreetStyle',
      image: 'https://i5.walmartimages.com/seo/CoCopeaunts-new-Embroidered-Messenger-Bags-Women-Leather-Handbags-Hand-Bags-for-Women-Sac-a-Main-Ladies-Hand-Bag-Female-bag-sac-femme_934c9131-d115-4666-b416-8655d70b1198.4e27af0d08f935fc1148430cec95659a.jpeg',
      discount: 'UP TO 25% OFF',
      category: 'Bags & Accessories',
    },
    {
      id: 5,
      title: 'MINIMALIST PICKS',
      date: 'NOV 18',
      badge: '#FreshFit',
      image: 'https://packmojo.com/blog/images/2021/06/weekly-favorites-minimalist-skincare-packaging-designs.jpg',
      discount: 'STARTING AT ₱299',
      category: 'Health & Personal Care',
    },
    {
      id: 6,
      title: 'WORKOUT WEAR',
      date: 'NOV 25',
      badge: '#ActiveFit',
      image: 'https://media.istockphoto.com/id/466367844/photo/clothes-make-running.jpg?s=612x612&w=0&k=20&c=eGOSP7X2MoXpGKhv8a3UlYHplvKvIIdUPmVKBSd3bMI=',
      discount: 'UP TO 35% OFF',
      category: 'Shoes',
    },
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
 
  // auto-slide every 5 seconds
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
                <div
                  className={classes.join(' ')}
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/products?category=${encodeURIComponent(s.category || s.title)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/products?category=${encodeURIComponent(s.category || s.title)}`);
                    }
                  }}
                  aria-label={`View products: ${s.category || s.title}`}
                >
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
        <button className="hero-nav-btn hero-prev" onClick={prevSlideAction} aria-label="Previous slide">
          ❮
        </button>
        <button className="hero-nav-btn hero-next" onClick={nextSlide} aria-label="Next slide">
          ❯
        </button>

        {/* Dots Indicator */}
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Banner Section */}
      <div className="hero-right-section">
        <div className="hero-right-item hero-right-top" style={{cursor:'pointer'}} onClick={() => navigate('/topup')}>
            <span className="right-badge"><h3>Discounts are waiting for YOU with</h3></span>
            <h3>#LazzappeePay!</h3>
            <p>Get 5% off with LazzappeeCoins!</p>
          </div>
        <div className="hero-right-item hero-right-bottom" onClick={() => navigate('/products')} style={{cursor:'pointer'}}>
          <h2>ALL LAZZAPPEE PRODUCTS</h2>
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
 

 