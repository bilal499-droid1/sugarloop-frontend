import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product, qty) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        )
      }
      return [...current, { id: product.id, name: product.name, price: product.price, image: product.image, qty }]
    })
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
