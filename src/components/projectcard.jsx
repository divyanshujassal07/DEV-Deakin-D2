function ProjectCard({ image, title, description, link }) {
  return (
    <div className="card">
      <img src={image} alt={title} />

      <h3>{title}</h3>

      <p>{description}</p>

      <a href={link} target="_blank" rel="noreferrer">
        GitHub
      </a>
    </div>
  );
}

export default ProjectCard;