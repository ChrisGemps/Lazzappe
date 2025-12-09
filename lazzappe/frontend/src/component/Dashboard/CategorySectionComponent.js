import { useState } from "react";
import categories from '../../constants/categories';
import { useNavigate } from 'react-router-dom';
import CategoryCard from "./CategoryCard";
import '../../css/Dashboard/CategorySectionComponent.css';

export default function CategorySectionComponent(){
  // Use shared categories constant so forms can use the same list
  const [localCategories] = useState(categories);

  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Navigate to products listing with category filter
    const encoded = encodeURIComponent(category.label);
    navigate(`/products?category=${encoded}`);
  };

  return (
    <div className="category-section">
      <h1 className="category-title">
        CATEGORIES
      </h1>
      
      <div className="category-grid">
        {localCategories.map((category) => (
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