import React, { useState, useRef } from "react";
import axios from "axios";
import "./ResumeUpload.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import View from "./View";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayView, setDisplayView] = useState(false);
  const dropRef = useRef();
  const fileInputRef = useRef();
  
  const hrEmailAddress =
  JSON.parse(localStorage.getItem("talentUser") || "{}")?.email || "";


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    dropRef.current.classList.remove("drag-over");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("drag-over");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");
    if (!jobDescription.trim()) return alert("Please enter a job description");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setParsedData(response.data.parsedData);
      setGithubData(response.data.githubData);
      setAnalytics(response.data.analytics);

      const fitScore = response.data.analytics.fitScore;
      const status =
        fitScore <= 50
          ? "Rejected"
          : fitScore <= 75
          ? "In Review"
          : "ShortListed";

      await axios.post("http://localhost:5000/api/analysedData/mdb", {
        fullName: response.data.parsedData.fullName,
        skills: response.data.parsedData.skills.slice(0, 4),
        fitScore,
        status,
        hrEmail: hrEmailAddress,
      });

      console.log("Analytics:", response.data.analytics);
      console.log("GitHub Data:", response.data.githubData);
    } catch (err) {
      console.error("Error uploading resume:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const renderList = (title, data) => (
    <div className="resume-section">
      <h3>{title}</h3>
      {data && data.length > 0 ? (
        <ul>
          {data.map((item, idx) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="unavailable">Unavailable</p>
      )}
    </div>
  );

  const displayField = (label, value) => (
    <p>
      <strong>{label}:</strong>{" "}
      {value || <span className="unavailable">Unavailable</span>}
    </p>
  );

  return (
    <div className="outerContainer">
      <div className="resume-container container">
        <h2 className="resume-title">
          Upload Your Resume <FontAwesomeIcon icon={faFileArrowUp} />
        </h2>
        <div className="resume-components">
          <div
            className="drop-area"
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileSelect}
          >
            <p>
              {file
                ? `Selected: ${file.name}`
                : "Drag & Drop or Click to Select"}
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input"
            />
          </div>

          <div className="job-description-section">
            <h3>Job Description</h3>
            <textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="job-description-textarea"
            ></textarea>
          </div>
        </div>

        <div className="upload-form">
          <button
            onClick={triggerFileSelect}
            type="button"
            className="upload-btn alt-btn"
          >
            Select Resume <FontAwesomeIcon icon={faFileArrowUp} />
          </button>
          <button onClick={handleUpload} type="submit" className="upload-btn">
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {parsedData && analytics && (
          <div className="parsed-output">
            <h2 className="section-header">
              Profile Analyzed by TalentSleuth AI
            </h2>
            <table cellSpacing={"10px"}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Skills</th>
                  <th>Role Match</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{parsedData.fullName}</td>
                  <td>
                    <div>
                      {parsedData.skills.slice(0, 4).map((skill, index) => (
                        <span key={index}>{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {analytics.fitScore}%
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${analytics.fitScore}%`,
                          background: analytics.fitScore >= 60 ? "lime" : "red",
                        }}
                      >
                        <span className="progress-text"></span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      className="status"
                      style={{
                        border:
                          analytics.fitScore <= 50
                            ? "2px solid red"
                            : analytics.fitScore <= 75
                            ? "2px solid #ffb300"
                            : "2px solid lime",
                        background:
                          analytics.fitScore <= 50
                            ? "#ff000020"
                            : analytics.fitScore <= 75
                            ? "#ffb30020"
                            : "#55ff0020",
                      }}
                    >
                      {analytics.fitScore <= 50
                        ? "Rejected"
                        : analytics.fitScore <= 75
                        ? "In Review"
                        : "ShortListed"}
                    </div>
                  </td>
                  <td>
                    <div
                      onClick={() => {
                        setDisplayView(true);
                      }}
                      className="status view"
                    >
                      View <FontAwesomeIcon icon={faEye} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <View
              display={displayView}
              setDisplay={setDisplayView}
              data={analytics}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUpload;
