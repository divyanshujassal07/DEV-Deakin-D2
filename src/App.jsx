import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/header";
import Hero from "./components/hero";
import Projects from "./components/projects";
import PhotoGallery from "./components/photogallery";
import Subscribe from "./components/subscribe";
import FeaturedArticle from "./components/featuredarticle";
import FeatureTutorial from "./components/featuretutorial";
import Footer from "./components/footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewPost from "./pages/NewPost";
import Pricing from "./pages/Pricing";
import BrowsePosts from "./pages/BrowsePost";

function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <PhotoGallery />
      <FeaturedArticle />
      <FeatureTutorial />
      <Subscribe />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/post" element={<NewPost />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/browse-posts" element={<BrowsePosts />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;