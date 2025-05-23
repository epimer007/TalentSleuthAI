import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AnalysedCandidatesTable = () => {
  const [candidates, setCandidates] = useState([]);
  const email = JSON.parse(localStorage.getItem("talentUser")).email;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/analysedData/"); // adjust route as needed
        setCandidates(res.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
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
          {candidates.map((data, index) => {
            const fitScore = data.fitScore;
            const statusText =
              fitScore <= 50
                ? "Rejected"
                : fitScore <= 75
                ? "In Review"
                : "ShortListed";
            const statusColor =
              fitScore <= 50
                ? { border: "2px solid red", background: "#ff000020" }
                : fitScore <= 75
                ? { border: "2px solid #ffb300", background: "#ffb30020" }
                : { border: "2px solid lime", background: "#55ff0020" };

            return (
              <>
                <tr key={index}>
                  <td>{data.fullName}</td>
                  <td>
                    <div>
                      {data.skills.slice(0, 4).map((skill, i) => (
                        <span key={i}>{skill} </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {fitScore}%
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${fitScore}%`,
                          background: fitScore >= 60 ? "lime" : "red",
                        }}
                      >
                        <span className="progress-text"></span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="status" style={statusColor}>
                      {statusText}
                    </div>
                  </td>
                  <td>
                    <div className="status view">
                      View <FontAwesomeIcon icon={faEye} />
                    </div>
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysedCandidatesTable;
