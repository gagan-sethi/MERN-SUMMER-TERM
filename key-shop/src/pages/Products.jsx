import {useState } from 'react';

function Products({addToCart}) {

  const products = [
    {
      id:101,
      name: 'Cartoon Key Chain',
      description: 'Colorful and cute design.',
      price: 99,
      image: '/images/shopping.webp'
    },
    {
       id:102,
      name: 'Name Key Chain',
      description: 'Customized with your name.',
      price: 149,
      image: '/images/name.webp'
    },
    {
       id:103,
      name: 'Leather Key Chain',
      description: 'Premium and classy look.',
      price: 199,
      image: '/images/leather.jpg'
    },
    {
       id:104,
      name: 'Avengers Key Chain',
      description: 'Your super hero key chain.',
      price: 210,
      image: '/images/captain.webp'
    }
  ];

  const [searchText, setSearchText]= useState("");
  const [selectedCategory, setSelectedCategory]= useState("All");

  const filteredProducts= products.filter((product)=>{
    const matchesSearch=product.name.toLowerCase().includes(searchText.toLowerCase());

  
  const matchedCategory= selectedCategory === "All" || product.category===selectedCategory;

  return matchedCategory &&  matchesSearch;
  });

  return (
    <section className="productsPage">
      <div className="productsBanner">
        <h1>Our Products</h1>
        <p>Explore stylish, customized and premium key chains.</p>
      </div>
    </section>
  );
}

export default Products;