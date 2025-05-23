import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (props.login) {
      props.notify("setting up...", "#9b51e0");
      navigate("/resume-upload");
    } else {
      props.notify("Please login first!!", "#9b51e0");
    }
  };
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to TalentSleuth AI</h1>
      <p className="home-subtitle">
        Built for Today, Powered by AI — Your Intelligent Career Companion.
      </p>
      <p className="home-description">
        TalentSleuth AI helps you effortlessly match top talent with the right
        job roles using advanced resume parsing, intelligent job matching, and
        insightful analytics. Our futuristic platform empowers HR professionals
        and candidates alike to streamline recruitment with precision, speed,
        and smart technology.
      </p>

      <div
        className="home-actions"
        style={{ filter: props.login ? "none" : "grayscale(100%)" }}
      >
        <a
          href={props.login ? null : "/resume-upload"}
          onClick={() => {
            handleClick();
          }}
          className="home-button"
        >
          Upload Resume
        </a>
        <a
          href={props.login ? null : "/job-matching"}
          onClick={() => {
            props.login
              ? props.notify("setting up...", "#9b51e0")
              : props.notify("Please login first!!", "#9b51e0");
          }}
          className="home-button"
        >
          Find a Match
        </a>
      </div>
    </div>
  );
};

export default Home;
