import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    institutes: 0,
    events: 0,
    participants: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [instRes, eventRes, partRes] = await Promise.all([
        API.get("/institutes?limit=1"),
        API.get("/events?limit=1"),
        API.get("/participants?limit=1"),
      ]);
      
      setStats({
        institutes: instRes.data.pagination?.total || instRes.data.count || 0,
        events: eventRes.data.pagination?.total || eventRes.data.count || 0,
        participants: partRes.data.pagination?.total || partRes.data.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle={"Dashboard"}/>
      <main className="content-wrapper">
        <div className="container-fluid pt-2">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="stat-card-premium shadow-sm">
                <div className="stat-icon bg-primary-soft">
                  <i className="fas fa-university text-primary"></i>
                </div>
                <div className="stat-data">
                  <h5>{loading ? "..." : stats.institutes}</h5>
                  <p>Total Institutes</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card-premium shadow-sm">
                <div className="stat-icon bg-success-soft">
                  <i className="fas fa-calendar-check text-success"></i>
                </div>
                <div className="stat-data">
                  <h5>{loading ? "..." : stats.events}</h5>
                  <p>Active Events</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card-premium shadow-sm">
                <div className="stat-icon bg-warning-soft">
                  <i className="fas fa-users text-warning"></i>
                </div>
                <div className="stat-data">
                  <h5>{loading ? "..." : stats.participants}</h5>
                  <p>Participants</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;