import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CorporateGiftingPage from './pages/CorporateGiftingPage'
import FaqPage from './pages/FaqPage'
import BuildYourBoxPage from './pages/BuildYourBoxPage'
import CartPage from './pages/CartPage'
import NotFoundPage from './pages/NotFoundPage'
import StaffLoginPage from './pages/staff/StaffLoginPage'
import StaffOrdersPage from './pages/staff/StaffOrdersPage'
import StaffStockPage from './pages/staff/StaffStockPage'
import RequireStaffAuth from './components/staff/RequireStaffAuth'
import StaffLayout from './components/staff/StaffLayout'
import ScrollToTop from './components/ScrollToTop'
import PageLoader from './components/PageLoader'
import { CartProvider } from './context/CartContext'
import { CatalogueProvider } from './context/CatalogueContext'
import { BranchProvider } from './context/BranchContext'
import { StaffAuthProvider } from './context/StaffAuthContext'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Outermost: the catalogue fetch is branch-scoped (stock is per branch), and the
          cart re-reads names and prices off the catalogue. So branch, then catalogue,
          then cart. */}
      <BranchProvider>
        <CatalogueProvider>
          <CartProvider>
            <PageLoader>
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/corporate-gifting" element={<CorporateGiftingPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/build-your-box" element={<BuildYourBoxPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  {/* The staff console. Its own auth context and API client — see
                      staffApi.js — rather than anything the storefront routes share,
                      so a bug in the customer cart can never reach an order board. */}
                  <Route
                    path="/staff/*"
                    element={
                      <StaffAuthProvider>
                        <Routes>
                          <Route path="login" element={<StaffLoginPage />} />
                          <Route element={<RequireStaffAuth />}>
                            <Route element={<StaffLayout />}>
                              <Route index element={<StaffOrdersPage />} />
                              <Route path="orders" element={<StaffOrdersPage />} />
                              <Route path="stock" element={<StaffStockPage />} />
                            </Route>
                          </Route>
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </StaffAuthProvider>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </PageLoader>
          </CartProvider>
        </CatalogueProvider>
      </BranchProvider>
    </BrowserRouter>
  )
}
