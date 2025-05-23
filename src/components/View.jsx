import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./view.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
export default function View(props) {
  const [data, setData] = useState(props.data);
  console.log("Data in View component:", data);
  return (
    <div
      className="outerView"
      style={{ display: props.display ? "grid" : "none" }}
    >
      <div className="viewbox">
        <h1>Candidate Analytics</h1>
        <div className="fit">Fit Score : {data.fitScore}</div>
        <div className="Strengths">Strengths : {data.strengths}</div>
        <div className="Weaknesses">Weaknesses : {data.weaknesses}</div>
        <div className="relevantProject">
          relevantProject : {data.relevantProjects}
        </div>
        <div className="redFlags">
          Red flags:{" "}
          {data.redFlags.map((flag, index) => (
            <li key={index}>{flag}</li>
          ))}
        </div>
      </div>
      <span
        className="close"
        onClick={() => {
          props.setDisplay(false);
        }}
      >
        <FontAwesomeIcon icon={faXmark} />
      </span>
    </div>
  );
}
