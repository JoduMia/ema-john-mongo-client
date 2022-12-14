import React, { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { addToDb, deleteShoppingCart, getStoredCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [dataPerpage, setDataPerpage] = useState(10);
    const totalPages = Math.ceil(count / dataPerpage);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:5000/products/?page=${currentPage}&size=${dataPerpage}`)
        .then(res => res.json())
        .then(data => {
            setCount(data.count);
            setProducts(data.products);
        })
        .catch(error => {
        })
    },[currentPage, dataPerpage])

    const clearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    useEffect(() => {
        const storedCart = getStoredCart();
        const ids = Object.keys(storedCart);
        const savedCart = [];

        fetch(`http://localhost:5000/productsByIds`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ids)
        })
        .then(res => res.json())
        .then(storedProduct => {
            for (const id in storedCart) {
                const addedProduct = storedProduct.find(product => product._id === id);
                if (addedProduct) {
                    const quantity = storedCart[id];
                    addedProduct.quantity = quantity;
                    savedCart.push(addedProduct);
                }
            }
            setCart(savedCart);
        })
        .catch(error => {
            console.log(error);
        })


    }, [])

    const handleAddToCart = (selectedProduct) => {
        let newCart = [];
        const exists = cart.find(product => product._id === selectedProduct._id);
        if (!exists) {
            selectedProduct.quantity = 1;
            newCart = [...cart, selectedProduct];
        }
        else {
            const rest = cart.filter(product => product._id !== selectedProduct._id);
            exists.quantity = exists.quantity + 1;
            newCart = [...rest, exists];
        }

        setCart(newCart);
        addToDb(selectedProduct._id);
    }

    return (
        <div className='shop-container'>
            <div>
                <div className="products-container">
                    {
                        products.map(product => <Product
                            key={product._id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                        ></Product>)
                    }
                </div>
                <div className='center'>
                    <button onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage === 0 && true}>Prev</button>
                    {
                        [...Array(totalPages).keys()].map(num => (
                            <button
                            onClick={() => setCurrentPage(num)}
                            className={currentPage === num ? 'currentPages' : undefined}
                            key={num}>{num}</button>
                        ))
                    }
                    <button onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage === totalPages-1 && true}>Next</button>

                    <select defaultValue={10} onChange={e => setDataPerpage(e.target.value)}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </div>
            </div>
            <div className="cart-container">
                <Cart clearCart={clearCart} cart={cart}>
                    <Link to="/orders">
                        <button>Review Order</button>
                    </Link>
                </Cart>
            </div>
        </div>
    );
};

export default Shop;