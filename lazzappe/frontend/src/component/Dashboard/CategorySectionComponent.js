import { useState } from "react";
import CategoryCard from "./CategoryCard";
import '../../css/Dashboard/CategorySectionComponent.css';

export default function CategorySectionComponent(){
  const [categories] = useState([
    { id: 1, icon: '👕', label: "Men's Apparel" },
    { id: 2, icon: '📱', label: 'Mobiles & Gadgets' },
    { id: 3, icon: '📱', label: 'Mobiles Accessories' },
    { id: 4, icon: '🖥️', label: 'Home Entertainment' },
    { id: 5, icon: '👶', label: 'Babies & Kids' },
    { id: 6, icon: '🔧', label: 'Home & Living' },
    { id: 7, icon: '🛒', label: 'Groceries' },
    { id: 8, icon: '🧸', label: 'Toys, Games & Collectibles' },
    { id: 9, icon: '👜', label: "Women's Bags" },
    { id: 10, icon: '😎', label: 'Women Accessories' },
    { id: 11, icon: '👗', label: "Women's Apparel" },
    { id: 12, icon: '💅', label: 'Health & Personal Care' },
    { id: 13, icon: '💄', label: 'Makeup & Fragrances' },
    { id: 14, icon: '🍊', label: 'Home Appliances' },
    { id: 15, icon: '💻', label: 'Laptops & Computers' },
    { id: 16, icon: '📷', label: 'Cameras' },
    { id: 17, icon: '⚽', label: 'Sports & Travel' },
    { id: 18, icon: '⌚', label: "Men's Bags & Accessories" },
    { id: 19, icon: '👟', label: "Men's Shoes" },
    { id: 20, icon: '🏍️', label: 'Motors' },
  ]);

  const handleCategoryClick = (category) => {
    console.log('Clicked:', category.label);
  };

  return (
    <div className="category-section">
      <h1 className="category-title">
        CATEGORIES
      </h1>
      
      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id}
            icon={category.icon}
            label={category.label}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </div>
  );
}