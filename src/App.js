import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./components/ResumeUpload";
import StatsCard from "./components/StatsCard";
import DashboardHeader from "./components/DashboardHeader";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Notification from "./components/Notification";
import AnalysedCandidatesTable from "./components/AnalysedCandidatesTable";
import "./App.css";

// Wrapper to allow redirect with useNavigate outside <Router>
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

const App = () => {
  const [message, setMessage] = useState("welcome ");
  const [notification, setNotification] = useState(false);
  const [color, setColor] = useState("#1e1e1e");
  const pushNotification = (data, color) => {
    setMessage(data);
    setColor(color);
    setNotification(true);

    setTimeout(() => {
      setNotification(false);
      setMessage("Hey user");
    }, 3950);
  };

  const [login, setLogin] = useState(true);
  const navigate = useNavigate();

  // ⏩ Check localStorage on first load
  useEffect(() => {
    const userData = localStorage.getItem("talentUser");
    if (userData) {
      setLogin(true);
      navigate("/"); // Redirect to Home if logged in
    }
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Notification
          message={message}
          display={notification}
          setNotification={setNotification}
          color={color}
        />
      </div>
      <DashboardHeader
        login={login}
        setLogin={setLogin}
        notify={pushNotification}
      />
      <div className="app-container" style={{ display: "flex" }}>
        <Sidebar login={login} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={<Home login={login} notify={pushNotification} />}
            />
            <Route
              path="/login"
              element={<Login setLogin={setLogin} notify={pushNotification} />}
            />
            <Route
              path="/register"
              element={<Register notify={pushNotification} />}
            />
            <Route path="/dashboard" element={<Dashboard login={login} />} />
            <Route path="/resume-upload" element={<ResumeUpload />} />
            <Route path="/analyzed" element={<AnalysedCandidatesTable />} />
            <Route path="/stats" element={<StatsCard />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AppWrapper;
