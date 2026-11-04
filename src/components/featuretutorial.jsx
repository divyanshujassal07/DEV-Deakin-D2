import gitImage from "../assets/git.png";
import reactImage from "../assets/reactbasics.png";
import pythonImage from "../assets/pythonbasics.png";

function FeatureTutorial() {
  return (
    <section className="featured-tutorials">
      <h2>Featured Tutorials</h2>

      <div className="tutorial-container">

        {/* Git tutorial */}
        <div className="tutorial-card">
          <img src={gitImage} alt="Git and GitHub Basics" />
          <h3>Git & GitHub Basics</h3>
          <p>
            Learn the basics of Git and how to manage projects with GitHub.
          </p>
          <p>★★★★★ 4.8/5</p>
          <p>By Divyanshu</p>
          <a href="#">Read Tutorial</a>
        </div>

        {/* React tutorial */}
        <div className="tutorial-card">
          <img src={reactImage} alt="React Basics" />
          <h3>React Basics</h3>
          <p>
            Learn the basics of React components and JSX.
          </p>
          <p>★★★★★ 4.7/5</p>
          <p>By Divyanshu</p>
          <a href="#">Read Tutorial</a>
        </div>

        {/* Python tutorial */}
        <div className="tutorial-card">
          <img src={pythonImage} alt="Python Basics" />
          <h3>Python Basics</h3>
          <p>
            Learn the fundamentals of Python programming.
          </p>
          <p>★★★★★ 4.9/5</p>
          <p>By Divyanshu</p>
          <a href="#">Read Tutorial</a>
        </div>

      </div>

      <a href="#">See all tutorials</a>
    </section>
  );
}

export default FeatureTutorial;