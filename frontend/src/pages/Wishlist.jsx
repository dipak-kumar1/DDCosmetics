import React from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleAddToCart = (product) => {
    addToCart(product)
    removeFromWishlist(product._id)
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save items you love to your wishlist.</p>
        <Link
          to="/shop"
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
              <div className="relative aspect-w-1 aspect-h-1 h-64 bg-gray-200">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-pink-500 font-medium mb-1">{product.category}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
