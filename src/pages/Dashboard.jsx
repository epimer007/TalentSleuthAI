import StatsCard from "../components/StatsCard";
import ResumeUpload from "../components/ResumeUpload";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="outerContainer">
      <div className="dashboard-container">
        <p>
          Welcome back! Here's what's happening with your recruitment today.
        </p>
        <div className="stats-row">
          <StatsCard
            title="Active Candidates"
            value="0"
            change="+12% from last month"
            icon="👤"
          />
          <StatsCard
            title="Open Positions"
            value="3"
            change="+5% from last month"
            icon="📂"
          />
          <StatsCard
            title="Interviews Scheduled"
            value="0"
            change="-3% from last month"
            icon="📅"
          />
          <StatsCard
            title="Time to Hire (Avg)"
            value="18 days"
            change="Better by 2 days"
            icon="⏱️"
          />
        </div>
        <div className="main-widgets">
          <ResumeUpload />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
