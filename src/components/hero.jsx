import banner from "../assets/banner.png";
import profilePhoto from "../assets/Personal Photo.jpg";

function Hero() {
  return (
    <>
      <section className="banner">
        <img src={banner} alt="Deakin University Banner" />

        <div className="overlay">
          <h2>Hey, I'm Divyanshu</h2>
        </div>
      </section>

      <section id="about" className="about">
        <img src={profilePhoto} alt="Divyanshu Profile Photo" />

        <h2>
          I am a BE Artificial Intelligence & Machine Learning Student
        </h2>

        <p>
          I enjoy building websites, AI applications and programming
          projects. I am currently studying Artificial Intelligence &
          Machine Learning and continuously improving my programming,
          frontend and backend development skills.
        </p>
      </section>
    </>
  );
}

export default Hero;