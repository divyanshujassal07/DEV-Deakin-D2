import photo2 from "../assets/photo2.jpg";
import photo3 from "../assets/photo3.jpg";
import photo4 from "../assets/photo4.jpg";
import photo5 from "../assets/photo5.jpg";
import photo6 from "../assets/photo6.jpg";
import photo7 from "../assets/photo7.jpg";

function PhotoGallery() {
  return (
    <section id="gallery" className="gallery-section">

      <h2>My Photos</h2>

      <div className="gallery">

        <div className="gallery-item">
          <img src={photo2} alt="Gallery Photo 1" />
        </div>

        <div className="gallery-item">
          <img src={photo3} alt="Gallery Photo 2" />
        </div>

        <div className="gallery-item">
          <img src={photo4} alt="Gallery Photo 3" />
        </div>

        <div className="gallery-item">
          <img src={photo5} alt="Gallery Photo 4" />
        </div>

        <div className="gallery-item">
          <img src={photo6} alt="Gallery Photo 5" />
        </div>

        <div className="gallery-item">
          <img src={photo7} alt="Gallery Photo 6" />
        </div>

      </div>

    </section>
  );
}

export default PhotoGallery;