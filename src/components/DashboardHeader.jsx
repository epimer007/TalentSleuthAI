import "./DashboardHeader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { faSign, faSignature, faUser } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
const DashboardHeader = (props) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("talentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.name);
    }
  }, [props.login]); // Re-run when login state changes

  return (
    <div className="header">
      <div>
        <img src="favicon.jpg" alt="logo" className="logo" />
        <span className="gradient-text-animated">TalentSleuth AI</span>
      </div>
      {props.login ? (
        <div>
          User {userName}{" "}
          <div
            className="logout"
            onClick={() => {
              props.notify("Logout successful!", "#9b51e0");
              localStorage.removeItem("talentUser");
              props.setLogin(false); // Update login state in App.js
            }}
          >
            logout
          </div>
        </div>
      ) : (
        <div>
          <NavLink to="/Login" className="sidebar-link">
            <FontAwesomeIcon icon={faUser} /> Login
          </NavLink>
          <NavLink to="/Register" className="sidebar-link">
            <FontAwesomeIcon icon={faSignature} /> Register
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
