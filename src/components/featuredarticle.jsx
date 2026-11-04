import article1 from "../assets/ai.png";
import article2 from "../assets/react1.png";
import article3 from "../assets/web.png";

const articles = [
  {
    title: "Introduction to Artificial Intelligence",
    description: "Explore the basic concepts of Artificial Intelligence.",
    image: article1
  },
  {
    title: "Getting Started with React",
    description: "Learn the basics of React components and JSX.",
    image: article2
  },
  {
    title: "Web Development Basics",
    description: "Learn the fundamentals of modern web development.",
    image: article3
  }
];

function FeaturedArticle() {
  return (
    <section className="featured-articles">
      <h2>Featured Articles</h2>

      <div className="article-container">
        {articles.map((article) => (
          <div className="article-card" key={article.title}>
            <img src={article.image} alt={article.title} />
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedArticle;