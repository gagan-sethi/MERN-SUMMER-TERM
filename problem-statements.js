//You are given an array of customer orders from an online store. Each order contains customer details, purchased items, quantity, price, discount, and payment status.

const orders = [
  {
    orderId: "ORD101",
    customerName: "Aman",
    city: "Delhi",
    paymentStatus: "Paid",
    items: [
      { product: "Laptop", category: "Electronics", price: 55000, quantity: 1, discount: 10 },
      { product: "Mouse", category: "Electronics", price: 800, quantity: 2, discount: 5 }
    ]
  },
  {
    orderId: "ORD102",
    customerName: "Priya",
    city: "Mumbai",
    paymentStatus: "Pending",
    items: [
      { product: "Shoes", category: "Fashion", price: 2500, quantity: 2, discount: 20 },
      { product: "T-Shirt", category: "Fashion", price: 900, quantity: 3, discount: 10 }
    ]
  },
  {
    orderId: "ORD103",
    customerName: "Rohit",
    city: "Delhi",
    paymentStatus: "Paid",
    items: [
      { product: "Mobile", category: "Electronics", price: 30000, quantity: 1, discount: 15 },
      { product: "Headphones", category: "Electronics", price: 2000, quantity: 2, discount: 10 }
    ]
  },
  {
    orderId: "ORD104",
    customerName: "Anjali",
    city: "Bangalore",
    paymentStatus: "Failed",
    items: [
      { product: "Book", category: "Education", price: 600, quantity: 4, discount: 0 },
      { product: "Pen Drive", category: "Electronics", price: 1200, quantity: 1, discount: 5 }
    ]
  }
];

//Using only map(), reduce(), and normal JavaScript logic, generate a complete order analytics report. Convert into below format:

/*{
  orderId: "ORD101",
  customerName: "Aman",
  city: "Delhi",
  paymentStatus: "Paid",
  totalItems: 3,
  grossAmount: 56600,
  totalDiscount: 5580,
  netAmount: 51020,
  orderStatus: "Successful"
} */

const orderAnalyticsReport = orders.map(order => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const grossAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const totalDiscount = order.items.reduce((sum, item) => sum + ((item.price * item.quantity) * (item.discount / 100)), 0);

  const netAmount = grossAmount - totalDiscount;
  const orderStatus = order.paymentStatus === "Paid" ? "Successful" : "Unsuccessful";

  return {
    orderId: order.orderId,
    customerName: order.customerName,
    city: order.city,
    paymentStatus: order.paymentStatus,
    totalItems: totalItems,
    grossAmount,
    totalDiscount,
    netAmount,
    orderStatus
  }
});


console.log("Order Analytics Report:", orderAnalyticsReport);