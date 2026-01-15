/**
 * Home Page Component
 * Exact match to original Thymeleaf index.html
 * Features: Hero slider, category cards, latest arrivals
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides matching original
  const heroSlides = [
    {
      image: 'https://placehold.co/1920x600/ff7c04/white?text=Elegant+Sarees+Collection',
      title: 'Elegant Sarees Collection',
      subtitle: 'Discover timeless beauty',
      cta: 'Shop Sarees',
      link: '/products?category=Sarees'
    },
    {
      image: 'https://placehold.co/1920x600/e66d03/white?text=Designer+Lehengas',
      title: 'Designer Lehengas',
      subtitle: 'Perfect for every celebration',
      cta: 'Explore Lehengas',
      link: '/products?category=Lehengas'
    },
    {
      image: 'https://placehold.co/1920x600/222/white?text=Trendy+Kurtis',
      title: 'Trendy Kurtis',
      subtitle: 'Comfort meets style',
      cta: 'Browse Kurtis',
      link: '/products?category=Kurtis'
    },
    {
      image: 'https://placehold.co/1920x600/ff7c04/white?text=Mom+%26+Me+Collection',
      title: 'Mom & Me Collection',
      subtitle: 'Matching outfits for special moments',
      cta: 'View Collection',
      link: '/products?category=Mom & Me'
    },
    {
      image: 'https://placehold.co/1920x600/e66d03/white?text=Clearance+Sale',
      title: 'Clearance Sale',
      subtitle: 'Up to 70% off on selected items',
      cta: 'Shop Sale',
      link: '/products?status=clearance'
    }
  ];

  // Categories matching original
  const categories = [
    { name: 'Sarees', image: 'https://placehold.co/400x300/ff7c04/white?text=Sarees' },
    { name: 'Lehengas', image: 'https://placehold.co/400x300/e66d03/white?text=Lehengas' },
    { name: 'Kurtis', image: 'https://placehold.co/400x300/222/white?text=Kurtis' },
    { name: 'Long Frocks', image: 'https://placehold.co/400x300/ff7c04/white?text=Long+Frocks' },
    { name: 'Mom & Me', image: 'https://placehold.co/400x300/e66d03/white?text=Mom+%26+Me' },
    { name: 'Crop Top – Skirts', image: 'https://placehold.co/400x300/222/white?text=Crop+Top' },
    { name: 'Handlooms', image: 'https://placehold.co/400x300/ff7c04/white?text=Handlooms' },
    { name: 'Ready To Wear', image: 'https://placehold.co/400x300/e66d03/white?text=Ready+To+Wear' },
    { name: 'Kids wear', image: 'https://placehold.co/400x300/222/white?text=Kids+Wear' }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Auto-advance slider (5s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const fetchFeaturedProducts = async () => {
    try {
      const products = await productService.getFeaturedProducts();
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-slider">
        <div className="slider-container">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.link} className="btn btn-brand btn-lg">
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button className="slider-arrow prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="slider-arrow next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Dots Navigation */}
          <div className="slider-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="categories-section py-5">
        <div className="container">
          <h2 className="section-title text-center mb-5">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="category-card"
              >
                <img src={category.image} alt={category.name} />
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="featured-products py-5">
        <div className="container">
          <h2 className="section-title text-center mb-5">Latest Arrivals</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/products" className="btn btn-outline-brand btn-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;