import {Link} from 'react-router-dom';

function Cart({cartItems}){
    console.log(cartItems);
    const totalAmount= cartItems.reduce((total, item)=> total + item.price*item.quantity, 0);

    if(cartItems.length === 0){
        return (
        <section className="cartPage emptyCart">
            <h1>Your Cart is Empty</h1>
            <p>You have not added any key chain yet</p>

            <Link to="/" class="continueShoppingBtn">Continue Shopping</Link>
        </section>
        )
    }

   return (
    <section className="cartPage">
        <div className="cartHeading">
            <h1>Your Shopping Cart</h1>
            <button className="clearCartBtn">Clear Cart</button>
        </div>
        
        <div className="cartLayout">
            <div class="cartItems">
                {
                    cartItems.map((item)=>(
                        <div className="cartItem">
                            <img src={item.image} alt={item.name} />
                            <div className="cartItemDetails">
                                <h3>{item.name}</h3>
                                <p>₹{item.price} each</p>

                                <div className="quantityBox">
                                    <button>
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button>
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="cartItemRight">
                             <strong>₹{item.price * item.quantity}</strong>
                             <button className="removeBtn">
                                Remove
                             </button>
                            </div>

                        </div>
                    ))
                }

            </div>
        </div>

      

    </section>
   )
}

export default Cart;