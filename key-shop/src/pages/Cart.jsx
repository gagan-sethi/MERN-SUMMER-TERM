import {Link} from 'react-router-dom';
import {useState} from 'react';

function Cart({cartItems, increaseQuantity, decreaseQuantity, clearCart}){
    console.log(cartItems);
    const totalAmount= cartItems.reduce((total, item)=> total + item.price*item.quantity, 0);
    const totalItems = cartItems.reduce((total,item)=>total + item.quantity, 0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showItemConfirmation, setShowItemConfirmation] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    if(cartItems.length === 0){
        return (
        <section className="cartPage emptyCart">
            <h1>Your Cart is Empty</h1>
            <p>You have not added any key chain yet</p>

            <Link to="/" class="continueShoppingBtn">Continue Shopping</Link>
        </section>
        )
    }

    const handleClearCart = () => {
        const confirmClear = window.confirm("Are you sure you want to clear the cart?");
        if (confirmClear) {
            clearCart();
        }
    }
    const handleDecreaseQuantity = (item) => {
        if (item.quantity === 1) {
            setSelectedItem(item);
            setShowItemConfirmation(true);
        }else{
            decreaseQuantity(item.id);
        }
    }

   return (
    <section className="cartPage">
        <div className="cartHeading">
            <h1>Your Shopping Cart</h1>
            <button className="clearCartBtn" onClick={()=>setShowConfirmation(true)}>Clear Cart</button>
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
                                    <button onClick={()=>handleDecreaseQuantity(item)}>
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={()=>increaseQuantity(item.id)}>
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

             <div className="cartSummary">
                <h2>Order Summary</h2>

                <div className="summaryRow">
                    <span>Total Items</span>
                    <strong>
                        {totalItems}
                    </strong>
                </div>

                <div class="summaryRow totalRow">
                    <span>Total Amount</span>
                    <strong>₹{totalAmount}</strong>
                </div>

                <button class="checkOutBtn">Proceed to Checkout</button>
                <Link to="/" className="continueLink">Continue Shopping</Link>

        </div>
      
        </div>

        {/* Confirmation Modal For Clearing Cart */}
        { showConfirmation && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>Clear Cart?</h3>
                        <p>Are you sure you want to remove all items?</p>

                        <button
                            onClick={() => {
                                clearCart();
                                setShowConfirmation(false);
                            }}
                        >
                            Yes
                        </button>

                        <button onClick={() => setShowConfirmation(false)}>
                            No
                        </button>
                    </div>
                </div>
            )  }

        {/* Confirmation Modal For Clearing Specific Item  */}

        { showItemConfirmation && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>Clear Item?</h3>
                        <p>Are you sure you want to remove {" "} <strong>{selectedItem.name}</strong>?</p>

                        <button
                            onClick={() => {
                                decreaseQuantity(selectedItem.id);
                                setShowItemConfirmation(false);
                            }}
                        >
                            Yes
                        </button>

                        <button onClick={() => setShowItemConfirmation(false)}>
                            No
                        </button>
                    </div>
                </div>
            )  }
    </section>
   )
}

export default Cart;