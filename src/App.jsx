import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CorporateGiftingPage from './pages/CorporateGiftingPage'
import FaqPage from './pages/FaqPage'
import BuildYourBoxPage from './pages/BuildYourBoxPage'
import { CartProvider } from './context/CartContext'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/corporate-gifting" element={<CorporateGiftingPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/build-your-box" element={<BuildYourBoxPage />} />
          </Routes>
        </main>
      </CartProvider>
    </BrowserRouter>
  )
}
