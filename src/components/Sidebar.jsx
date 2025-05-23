import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  faChartSimple,
  faFile,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = (props) => {
  return (
    <div className="sidebar" style={{ display: props.login ? "flex" : "none" }}>
      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          <FontAwesomeIcon icon={faHome} /> Home
        </NavLink>
        <NavLink to="/resume-upload" className="sidebar-link">
          <FontAwesomeIcon icon={faFile} /> Resume Upload
        </NavLink>
        <NavLink to="/analyzed" className="sidebar-link">
          Analyzed Data
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
