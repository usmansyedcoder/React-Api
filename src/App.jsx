import React, { useState } from "react";
import "./App.css";
import Api from "./Components/Api";
import JsonPlaceholderApi from "./Components/JsonPlaceholderApi";
import WeatherApi from "./Components/WeatherApi";

function App() {
  const [activeTab, setActiveTab] = useState("reddit");

  return (
    <div className="app">
      <header className="app-header">
        <h1>React API Concepts Demo</h1>
        <p>A collection of API integration examples in React</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === "reddit" ? "active" : ""}`}
          onClick={() => setActiveTab("reddit")}
        >
          Reddit API
        </button>
        <button
          className={`tab ${activeTab === "json" ? "active" : ""}`}
          onClick={() => setActiveTab("json")}
        >
          JSONPlaceholder
        </button>
        <button
          className={`tab ${activeTab === "weather" ? "active" : ""}`}
          onClick={() => setActiveTab("weather")}
        >
          Weather API
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "reddit" && <Api />}
        {activeTab === "json" && <JsonPlaceholderApi />}
        {activeTab === "weather" && <WeatherApi />}
      </main>

      <footer className="app-footer">
        <p>Learn React API concepts • Axios • Fetch • State Management • Error Handling</p>
      </footer>
    </div>
  );
}

export default App;
