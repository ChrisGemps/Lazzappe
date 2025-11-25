import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../component/ProductCard';
import ProductModal from '../component/ProductModal';
import { useCart } from '../context/CartContext';
import '../css/Dashboard/Products.css';

// Simple query parser
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Products() {
  const navigate = useNavigate();
  const query = useQuery();
  const category = query.get('category') || '';

  // For now, a mocked product list. Replace with fetch to API if available.
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const { addToCart } = useCart();

  useEffect(() => {
    // Mocked sample products. Replace with fetch(`/api/products`) for real data.
    const mock = [
      // Men's Apparel
      { id: 1, name: "Men's Classic Tee", category: "Men's Apparel", price: 599.99, image: 'https://img.lazcdn.com/g/p/18b963d0d661cbbda28a299c35664f26.jpg_720x720q80.jpg', description: 'Comfortable classic tee made of breathable cotton.' },
      { id: 2, name: "Men's Denim Jacket", category: "Men's Apparel", price: 1599.99, image: 'https://m.media-amazon.com/images/I/61ZllA3hqOL._AC_UY1000_.jpg', description: 'Stylish denim jacket with a modern cut.' },

      // Mobiles & Gadgets
      { id: 3, name: 'Apple iPhone 15', category: 'Mobiles & Gadgets', price: 5999.99, image: 'https://powermaccenter.com/cdn/shop/files/iPhone_15_Black_PDP_Image_Position-1__en-US_b83ede19-9012-4dd2-be21-e0bb792fca02.jpg?v=1754528415&width=823', description: 'Latest iPhone model with long battery life.' },
      { id: 4, name: 'Samsung Galaxy S24', category: 'Mobiles & Gadgets', price: 4999.99, image: 'https://digitalwalker.ph/cdn/shop/files/SAMUNTGALAXYS248_256GBAMBERYELLOW1_1000x1000.png?v=1706521737', description: 'Powerful performance and vibrant display.' },

      // Home Furnitures
      { id: 5, name: 'Modern Coffee Table', category: 'Home Furnitures', price: 2999.00, image: 'https://www.urbanconcepts.ph/wp/wp-content/uploads/2024/03/trinity-1.png', description: 'Sleek coffee table featuring solid wood and tempered glass.' },
      { id: 6, name: 'Comfort Sofa', category: 'Home Furnitures', price: 7999.00, image: 'https://ourhome.ph/cdn/shop/files/Seiv_2_Seater_Sofa_-_Measurements.jpg?v=1742202955&width=1200', description: 'A plush 3-seater sofa with durable upholstery.' },

      // Home Entertainment
      { id: 7, name: '4K Smart TV', category: 'Home Entertainment', price: 14999.00, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk2GAEv2BeZxDOAVaJZ2KF-YKarCTdaaZAyw&s', description: 'Cinematic 4K display with smart streaming features.' },
      { id: 8, name: 'Wireless Soundbar', category: 'Home Entertainment', price: 3499.00, image: 'https://www.sony.ca/image/3d3a90045fd945574b42b191f60f34e6?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF', description: 'Immersive sound with wireless connectivity.' },

      // Babies & Kids
      { id: 9, name: "Baby Stroller Deluxe", category: 'Babies & Kids', price: 4499.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8XEwtIta74fqHoMJadGRzzxAnvJFEy7sxzA&s', description: 'Safe and comfortable stroller for everyday use.' },
      { id: 10, name: "Infant Swing", category: 'Babies & Kids', price: 1299.99, image: 'https://i5.walmartimages.com/seo/Graco-Slim-Spaces-Compact-Infant-Swing-Space-Saving-Design-Gray-Tilden_15870fb3-20d7-4ed0-b598-d54ce826a597.595992fda61c99e3415801e0ddd0c6b6.jpeg', description: 'Gentle rocking swing to soothe your infant.' },

      // Home & Living
      { id: 11, name: 'Smart Vacuum Cleaner', category: 'Home & Living', price: 3499.99, image: 'https://web-res.midea.com/content/dam/midea-aem/ph/ph-new/pdp/vaccum/m7/M7Robot5-new.jpg', description: 'Automatic vacuum with strong suction and app control.' },
      { id: 12, name: 'Kitchen Knife Set', category: 'Home & Living', price: 799.99, image: 'https://images-cdn.ubuy.co.in/6814ce1c79dfa55b12045a0b-dfito-9-piece-kitchen-knife-set.jpg', description: 'Stainless steel knife set with wooden block.' },

      // Groceries
      { id: 13, name: 'Organic Orange Pack', category: 'Groceries', price: 199.99, image: 'https://eu-images.contentstack.com/v3/assets/blt17bf506a5fa8d55b/blt4e8d6b1b5d20dbe0/66715c0e25691dfb079e7fc7/image.png', description: 'Fresh, locally sourced organic oranges.' },
      { id: 14, name: 'Fresh Milk 1L', category: 'Groceries', price: 89.99, image: 'https://zbga.shopsuki.ph/cdn/shop/files/4800361422246_800x.jpg?v=1735908408', description: 'Fresh pasteurized milk in a convenient 1L pack.' },

      // Toys, Games & Collectibles
      { id: 15, name: 'Classic Toy Train', category: 'Toys, Games & Collectibles', price: 499.99, image: 'https://down-ph.img.susercontent.com/file/ce7b643764d9d6d0bd6bf4007aef9d05_tn', description: 'Timeless wooden toy train for kids.' },
      { id: 16, name: 'Puzzle 1000 pieces', category: 'Toys, Games & Collectibles', price: 349.99, image: 'https://www.puzzledly.com/cdn/shop/files/michael-storrings-autumn-by-the-sea-1000-piece-puzzle-puzzles-michael-storrings-225939.jpg?v=1762463240&width=320', description: 'Challenging 1000-piece puzzle, perfect for family time.' },

      // Women's Bags
      { id: 17, name: 'Leather Shoulder Bag', category: "Women's Bags", price: 2599.99, image: 'https://cdn.modesens.com/availability/53838553?w=400', description: 'Premium leather bag with roomy interior.' },
      { id: 18, name: 'Mini Crossbody', category: "Women's Bags", price: 999.99, image: 'https://cdn-images.farfetch-contents.com/25/37/57/04/25375704_56251604_600.jpg', description: 'Compact crossbody for essentials and a night out.' },

      // Accessories
      { id: 19, name: 'Sunglasses Polarized', category: 'Accessories', price: 799.99, image: 'https://www.warbyparker.com/learn/wp-content/uploads/2022/05/polarized_sunglasses.jpg', description: 'Polarized sunglasses with UV protection.' },
      { id: 20, name: 'Wrist Watch', category: 'Accessories', price: 1799.99, image: 'https://images.hugoboss.com/is/image/boss/hbeuHB1570177_999_200?$re_fullPageZoom$&qlt=85&fit=crop,1&align=1,1&bgcolor=ebebeb&lastModified=1763021763000&wid=1200&hei=1818', description: 'Elegant wrist watch with stainless steel band.' },

      // Women's Apparel
      { id: 21, name: "Women's Summer Dress", category: "Women's Apparel", price: 1299.99, image: 'https://m.media-amazon.com/images/I/71T5lQvh1QL.jpg', description: 'Lightweight summer dress with breathable fabric.' },
      { id: 22, name: "Women's Knit Sweater", category: "Women's Apparel", price: 1499.99, image: 'https://i5.walmartimages.com/seo/ARAN-WOOLLEN-MILLS-Womens-Aran-Knit-Sweater-Merino-Wool-Cowl-Neck-Cable-Knit-Natural-XL_6873da15-6ead-4412-b2e0-fb8bf6214bd3.e70afe68cd1f3b503b3c654266894ce2.jpeg', description: 'Cozy knit sweater for cooler days.' },

      // Health & Personal Care
      { id: 23, name: 'Facial Cleanser 200ml', category: 'Health & Personal Care', price: 399.99, image: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet92738/l/32.jpg', description: 'Gentle cleanser formulated for daily use.' },
      { id: 24, name: 'Vitamin C Serum', category: 'Health & Personal Care', price: 599.99, image: 'https://hips.hearstapps.com/hmg-prod/images/gh-best-vitamin-c-serums-66213d06500e9.png?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*', description: 'Boosts skin radiance with concentrated vitamin C.' },

      // Makeup & Fragrances
      { id: 25, name: 'Everyday Perfume 50ml', category: 'Makeup & Fragrances', price: 1299.99, image: 'https://scentlore.com/wp-content/uploads/2024/10/Flora-1-430x430.webp', description: 'Fresh, light scent that lasts all day.' },
      { id: 26, name: 'Matte Lipstick', category: 'Makeup & Fragrances', price: 499.99, image: 'https://www.makeup.com/-/media/project/loreal/brand-sites/mdc/americas/us/articles/2024/10-october/best-matte-lipsticks/mdc_matte-lipsticks_sept_product_maybelline.jpg?cx=0.5&cy=0.5&cw=705&ch=705&blr=False&hash=F4F92F38BADF9C80F4DB485BE50000F3', description: 'Long-wear matte finish available in many shades.' },

      // Home Appliances
      { id: 27, name: 'Microwave Oven', category: 'Home Appliances', price: 3999.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIOjQw509BfmkRwjMmRotUvG9lrjUcCF9AMQ&s', description: 'Compact microwave with multiple power settings.' },
      { id: 28, name: 'Air Fryer', category: 'Home Appliances', price: 3199.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAlnzHKgRUdaB77Z6v6EnN9xH1kWV69f1Qsg&s', description: 'Healthy fry alternative with fast heat-up.' },

      // Laptops & Computers
      { id: 29, name: 'Basic Laptop 14"', category: 'Laptops & Computers', price: 24999.99, image: 'https://cdn.shopify.com/s/files/1/0460/2567/0805/files/ASUS-VIVOBOOK-14X-X1404VA-EB1418WSM-INTEL-CORE-5-120U-16GB-3200MHZ-DDR4-MEMORY-INTEL-GRAPHICS-512GB-NVME-SSD-14_0-FULL-HD-IPS-LEVEL-DISPLAY-MS-OFFICE-2024-HS-OFFICE-365-BASIC-1YR-W.png?v=1756597408', description: 'Reliable laptop for everyday productivity.' },
      { id: 30, name: 'Gaming Laptop 16"', category: 'Laptops & Computers', price: 54999.99, image: 'https://m.media-amazon.com/images/I/81e7Jjh1CiL._AC_SL1500_.jpg', description: 'High-power gaming laptop with dedicated GPU.' },

      // Cameras
      { id: 31, name: 'Mirrorless Camera', category: 'Cameras', price: 25999.99, image: 'https://cdn.thewirecutter.com/wp-content/media/2023/05/mirrorless-camera-2048px-9621.jpg?auto=webp&quality=75&width=1024', description: 'High-resolution mirrorless camera for enthusiasts.' },
      { id: 32, name: 'Action Camera', category: 'Cameras', price: 7999.99, image: 'https://cdn.thewirecutter.com/wp-content/media/2025/06/BEST-ACTION-CAMERAS-2374-2x1-1.jpg?width=2048&quality=75&crop=2:1&auto=webp', description: 'Compact action camera built for adventure.' },

      // Sports & Travel
      { id: 33, name: 'Trekking Backpack', category: 'Sports & Travel', price: 1899.99, image: 'https://tripole.in/cdn/shop/files/Tripole-Walker-Pro-Rucksack-60L-Blue-SharkTank.jpg?v=1748089157&width=2500', description: 'Durable backpack with hydration pocket.' },
      { id: 34, name: 'Yoga Mat', category: 'Sports & Travel', price: 499.99, image: 'https://img.lazcdn.com/g/p/9873963af5dd5fb4ca53445c1233c6e9.jpg_720x720q80.jpg', description: 'Non-slip mat for all your yoga sessions.' },

      // Bags & Accessories
      { id: 35, name: 'Leather Tote Bag', category: 'Bags & Accessories', price: 2199.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlOpDSYtrDX6wX3-Bpdz2kP6WhhLJ9VpQZ8g&s', description: 'Classic leather tote for everyday essentials.' },
      { id: 36, name: 'Travel Organizer', category: 'Bags & Accessories', price: 1699.99, image: 'https://winterwearph.com.ph/cdn/shop/files/image_b3216272-e713-4f04-8d0e-6a700368f697_1200x1200.jpg?v=1684938447', description: 'Keep your travel documents and cords tidy.' },

      // Shoes
      { id: 37, name: 'Running Sneakers', category: 'Shoes', price: 1799.99, image: 'https://cdn.thewirecutter.com/wp-content/media/2024/05/runningshoesforyou-2048px-2254.jpg?auto=webp&quality=75&width=1024', description: 'Lightweight sneakers for long-distance runs.' },
      { id: 38, name: 'Formal Dress Shoes', category: 'Shoes', price: 2399.99, image: 'https://kxadmin.metroshoes.com/product/31-4989-23-36/1200/31-4989LA23.jpg', description: 'Elegant shoes for formal events.' },

      // Electric Bikes
      { id: 39, name: 'Urban E-bike', category: 'Electric Bikes', price: 59999.99, image: 'https://i5.walmartimages.com/seo/SOHAMO-400W-Folding-Electric-Bike-for-Adults-and-Teens-20MPH-3-Riding-Modes-Electric-Bike-with-48V-18AH-Removable-Battery-14-Urban-E-Bike_78e2ebcf-4d45-4f4b-af95-e4af0bbd2f47.c713e7e408db873af3eb130960467d7d.jpeg', description: 'Commuter friendly e-bike with ample range.' },
      { id: 40, name: 'Foldable E-scooter', category: 'Electric Bikes', price: 29999.99, image: 'https://m.media-amazon.com/images/I/71-p6Xz3PwL._AC_SL1500_.jpg', description: 'Compact foldable scooter for urban mobility.' }
    ];

    setProducts(mock);
  }, []);

  const filtered = useMemo(() => {
    const arr = category
      ? products.filter((p) => p.category && p.category.toLowerCase().includes(category.toLowerCase()))
      : products;

    // Alphabetical order by product name
    return arr.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [products, category]);

  return (
    <div className="products-wrapper">
      <div className="products-header">
        <h2>Products {category ? ` - ${category}` : ''}</h2>
        <div className="products-header-buttons">
          <button onClick={() => navigate('/cart')} className="btn btn-secondary">Go to Cart</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">← Back to Dashboard</button>
        </div>
      </div>

      <div className="products-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onViewDetails={(prod) => setSelectedProduct(prod)}
            onAddToCart={(prod) => {
              addToCart(prod);
              setToast({ show: true, message: `${prod.name} has been added to your cart` });
              setTimeout(() => setToast({ show: false, message: '' }), 2500);
            }}
          />
        ))}

        {filtered.length === 0 && (
          <div className="products-empty">
            No products found{category ? ` for category "${category}"` : ''}.
          </div>
        )}
      </div>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(prod) => { addToCart(prod); setToast({ show: true, message: `${prod.name} has been added to your cart` }); setTimeout(() => setToast({ show: false, message: '' }), 2500); }}
        />
      )}
      {toast.show && (
        <div className="products-toast">{toast.message}</div>
      )}
    </div>
  );
}
