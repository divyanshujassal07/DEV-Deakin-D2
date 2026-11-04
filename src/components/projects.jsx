import ProjectCard from "./projectcard";

import bmiImage from "../assets/Image1.png";
import registrationImage from "../assets/image.png";

function Projects() {
  return (
    <section id="work" className="work">

      <h2>My Projects</h2>

      <div className="projects">

        <ProjectCard
          image={bmiImage}
          title="BMI Calculator"
          description="This is for Calculating BMI (Body Mass Index Calculator)"
          link="https://github.com/divyanshujassal07/BMI-calculator"
        />

        <ProjectCard
          image={registrationImage}
          title="Student Registration Form"
          description="Student Registration"
          link="https://github.com/divyanshujassal07/Student-registration"
        />

      </div>

    </section>
  );
}

export default Projects;