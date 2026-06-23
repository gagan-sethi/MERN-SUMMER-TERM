import {Link} from 'react-router-dom';

function Cart({cartItems}){
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

    return (<section>
      <h1>Under Process...</h1>
    </section>)
}

export default Cart;