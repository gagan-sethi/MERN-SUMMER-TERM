import {useState} from 'react';

function Home({addToCart}) {

  const [counter, setCounter] = useState(10);
  const [btnText, setBtnText]= useState('Hello');
  const products = [
    {
      id:101,
      name: 'Cartoon Key Chain',
      description: 'Colorful and cute design.',
      price: 99,
      image: '/images/shopping.webp',
      stock:10
    },
    {
       id:102,
      name: 'Name Key Chain',
      description: 'Customized with your name.',
      price: 149,
      image: '/images/name.webp',
      stock:5
    },
    {
       id:103,
      name: 'Leather Key Chain',
      description: 'Premium and classy look.',
      price: 199,
      image: '/images/leather.jpg',
      stock:3
    },
    {
       id:104,
      name: 'Avengers Key Chain',
      description: 'Your super hero key chain.',
      price: 210,
      image: '/images/captain.webp',
      stock:2
    }
  ];

  return (
    <div className="app">
      {/* Hero Section */}
     <section className="hero">
        <div className="heroText">
          <h2>Beautiful Key Chain For Every Style</h2>
          <p>
            Explore stylish, cute and customized key chains for yourself and your friends and family.
          </p>
          <button>Shop Now</button>
        </div>
        
        <div className="heroImage">
          <img src="/images/keychainimage.webp" height="100%" width="100%" />
        </div>

     </section>
      
      { /* Product Section */}
     <section className="products">
      <h2>Our Popular Key Chains</h2>

      <div className="productGrid">

      { products.map((product, index)=>(

         <div className="card">
            <div className="imageBox">
              <img src={product.image} height="100%" width="100%" />
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>₹{product.price}</strong>
            <button className="cartBtn" onClick={()=> addToCart(product)}>Add to Cart</button>
        </div>
      
    ))}
       

      </div>
      

     </section>
    
    { /* About Section */}

    <section className="about">
      <h2>Why Choose Us?</h2>
      <p>
        We provide affordable, durable and nice designs, perfrect for gifting.
      </p>
    </section>

    </div>
  );
}

export default Home;