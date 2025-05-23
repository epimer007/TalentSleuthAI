import React from "react";
import "./Notification.css";

export default function Notification(props) {
  return (
    <div
      style={{
        display: props.display ? "flex" : "none",
        border: "2px solid" + props.color,
      }}
      className="notBox"
    >
      <div>{props.message}</div>
    </div>
  );
}
