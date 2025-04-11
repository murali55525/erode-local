import React, { useState, useEffect } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users/me/notifications", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {error && <p>{error}</p>}
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notif) => (
            <li key={notif._id}>
              {notif.message} - {new Date(notif.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;