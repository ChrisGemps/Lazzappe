import { useState } from "react";
import CategoryCard from "./CategoryCard";
import '../../css/Dashboard/CategorySectionComponent.css';

export default function CategorySectionComponent(){
  const [categories] = useState([
    { id: 1, icon: 'https://www.studiosuits.com/cdn/shop/articles/DALL_E_2024-12-30_15.14.16_-_An_artistic_and_stylish_depiction_showcasing_the_concept_of_Best_8_Men_s_Apparel_Brands_to_Upgrade_Your_Style_Game._The_image_features_a_selection_o.webp?v=1735568087', label: "Men's Apparel" },
    { id: 2, icon: 'https://gadgetflow1.home.blog/wp-content/uploads/2019/08/cool-gadgets.jpg', label: 'Mobiles & Gadgets' },
    { id: 3, icon: 'https://contentgrid.homedepot-static.com/hdus/en_US/DTCCOMNEW/Articles/best-furniture-for-your-home-2022-hero.jpg', label: 'Home Furnitures' },
    { id: 4, icon: 'https://www.allion.com/wp-content/uploads/2019/08/Smart_Home_BANNER-12-1024x823.jpg', label: 'Home Entertainment' },
    { id: 5, icon: 'https://m.media-amazon.com/images/I/61YmIkgYAeL._AC_UF894,1000_QL80_.jpg', label: 'Babies & Kids' },
    { id: 6, icon: 'https://hi-spec.com/cdn/shop/articles/Tools_Every_DIY_Mechanic_Needs_-_Header_image_800x800.jpg?v=1640855146', label: 'Home & Living' },
    { id: 7, icon: 'https://www.moneymax.ph/hs-fs/hubfs/assets_moneymax/640px-99_Ranch_Market_San_Jose_June_2011_001-e1586178211569.jpg?width=600&height=450&name=640px-99_Ranch_Market_San_Jose_June_2011_001-e1586178211569.jpg', label: 'Groceries' },
    { id: 8, icon: 'https://i.orientaltrading.com/transform/VIEWER_500/e9016d2c-1a86-47e6-bfc6-80b876a8ae7d/13942376-a01-jpg', label: 'Toys, Games & Collectibles' },
    { id: 9, icon: 'https://i5.walmartimages.com/seo/CoCopeaunts-new-Embroidered-Messenger-Bags-Women-Leather-Handbags-Hand-Bags-for-Women-Sac-a-Main-Ladies-Hand-Bag-Female-bag-sac-femme_934c9131-d115-4666-b416-8655d70b1198.4e27af0d08f935fc1148430cec95659a.jpeg', label: "Women's Bags" },
    { id: 10, icon: 'https://www.warbyparker.com/learn/wp-content/uploads/2022/05/types-of-sunglasses-hero.jpg', label: 'Accessories' },
    { id: 11, icon: 'https://www.fashiongonerogue.com/wp-content/uploads/2021/12/Mannequins-Womens-Clothing-Store-Red-Palette.jpg', label: "Women's Apparel" },
    { id: 12, icon: 'https://img.freepik.com/premium-photo/skin-care-products-healthcare-procedures-concept-hygiene-cosmetic-healthy-lifestyle-spa_266732-20971.jpg', label: 'Health & Personal Care' },
    { id: 13, icon: 'https://sokilondon.com/wp-content/uploads/2023/03/PERFUMES-THAT-SMELL-LIKE-MAKEUP-BG-jpg.webp', label: 'Makeup & Fragrances' },
    { id: 14, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMho3y153rQ4ZL9-DuTup4zDzzQQcdblbxEA&s', label: 'Home Appliances' },
    { id: 15, icon: 'https://vastresult.com/wp-content/uploads/2022/06/subbanner-pc-and-laptops.png', label: 'Laptops & Computers' },
    { id: 16, icon: 'https://legacybox.com/cdn/shop/articles/photo-1543785832-0781599790c2.jpg?v=1613403332&width=1399', label: 'Cameras' },
    { id: 17, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEG8ikj07NHw1dm_QCgdHB7i8m_FUSm-QSbA&s', label: 'Sports & Travel' },
    { id: 18, icon: 'https://media.gq.com/photos/66e9d9d2eb59acb244d66a14/master/w_1600%2Cc_limit/GQ1024_BagsCharms_01.jpg', label: "Bags & Accessories" },
    { id: 19, icon: 'https://d1nymbkeomeoqg.cloudfront.net/photos/28/73/408849_7358_XL.jpg', label: "Shoes" },
    { id: 20, icon: 'https://nationalbicycle.org.ph/wp-content/uploads/2021/05/dyu-d3-3-colors.jpg', label: 'Electric Bikes' },
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