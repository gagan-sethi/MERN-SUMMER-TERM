import {useEffect, useState} from 'react';

function Home({addToCart}) {

  const [counter, setCounter] = useState(10);
  const [btnText, setBtnText]= useState('Hello');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    const fetchProducts= async ()=>{
      try{
        const response = await fetch("http://localhost:3000/api/products");
        if(!response.ok){
          throw new Error("Unable to fetch products");
        }
        const data= await response.json();
        setProducts(data.products);
      }catch(error){
        console.error("Product API error", error);
        setError("Unable to load products, Please try again later!");
      }finally{
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

      {loading && <p>Loading Products...</p>}

      {error && <p className="errorMessage">{error}</p>}

      {!loading && !error && products.length == 0 && (
        <p>No Products available!!</p>
      )}

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