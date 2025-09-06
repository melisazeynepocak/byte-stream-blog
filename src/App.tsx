import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CategoryPage from "@/pages/Category";
import PostPage from "@/pages/Post";
import AdminPage from "@/pages/AdminDashboard";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPostEditor from "@/pages/AdminPostEditor";
import AdminHeadlines from "@/pages/AdminHeadlines";
import AdminTrendingTags from "@/pages/AdminTrendingTags";
import AdminFeaturedReview from "@/pages/AdminFeaturedReview";
import AdminPopularGuides from "@/pages/AdminPopularGuides";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Cookies from "@/pages/Cookies";
import EditorialPolicy from "@/pages/EditorialPolicy";
import AdsDisclosure from "@/pages/AdsDisclosure";
import TagPage from "@/pages/Tag";
import RehberlerPage from "@/pages/Rehberler";
import SitemapGenerator from "@/pages/SitemapGenerator";
import AdminRehberEditor from "@/pages/AdminRehberEditor";
import { CookieBanner } from "@/components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/old" element={<AdminPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/post/new" element={
              <ProtectedAdminRoute>
                <AdminPostEditor />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/headlines" element={
              <ProtectedAdminRoute>
                <AdminHeadlines />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/trending" element={
              <ProtectedAdminRoute>
                <AdminTrendingTags />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/featured-review" element={
              <ProtectedAdminRoute>
                <AdminFeaturedReview />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/popular-guides" element={
              <ProtectedAdminRoute>
                <AdminPopularGuides />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/post/edit/:postId" element={
              <ProtectedAdminRoute>
                <AdminPostEditor />
              </ProtectedAdminRoute>
            } />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/gizlilik-politikasi" element={<Privacy />} />
            <Route path="/cerez-politikasi" element={<Cookies />} />
            <Route path="/editorial-politika" element={<EditorialPolicy />} />
            <Route path="/reklam-affiliate" element={<AdsDisclosure />} />
            <Route path="/etiket/:tag" element={<TagPage />} />
            <Route path="/rehberler" element={<RehberlerPage />} />
            <Route path="/sitemap-generator" element={<SitemapGenerator />} />
            <Route path="/admin/rehber/new" element={
              <ProtectedAdminRoute>
                <AdminRehberEditor />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/rehber/edit/:rehberId" element={
              <ProtectedAdminRoute>
                <AdminRehberEditor />
              </ProtectedAdminRoute>
            } />
            <Route path="/kategori/:categorySlug" element={<CategoryPage />} />
            <Route path="/:categorySlug/:postSlug" element={<PostPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
