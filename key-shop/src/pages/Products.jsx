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
   const [selectedPrice, setSelectedPrice]= useState("All");

   function clearFilters(){
    setSelectedCategory("All");
    setSelectedPrice("All");
    setSearchText("")
   }

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

      <div className="productFilter">
        <input type="text" placeholder="Search Products..." value={searchText} onChange={(event)=>setSearchText(event.target.value)} className="productSearch" />

        <select value={selectedCategory} onChange={(event)=>setSelectedCategory(event.target.value)}>
          <option value="All">All Categories</option>
          <option value="Cartoon">Cartoon</option>
          <option value="Metal">Metal</option>
          <option value="Customized">Customized</option>
          <option value="Premium">Premium</option>
        </select>


        <select value={selectedPrice} onChange={(event)=>setSelectedPrice(event.target.value)}>
          <option value="All">All</option>
          <option value="Below 150">Below ₹150</option>
          <option value="150 to 250">₹150 to ₹250</option>
          <option value="Above 250">Above ₹250</option>
        </select>

        <button type="button" className="clearFilterBtn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="productResults">
        <p>Showing <strong>{filteredProducts.length}</strong> products</p>

      </div>
    </section>
  );
}

export default Products;