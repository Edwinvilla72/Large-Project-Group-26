import React, { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';

type LeaderboardType = 'global' | 'followers';

interface LeaderboardUser {
  username: string;
  level: number;
  xp: number;
}

const Leaderboard: React.FC = () => {
  const [type, setType] = useState<LeaderboardType>('global');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followUser, setFollowUser] = useState('');
  const [followMessage, setFollowMessage] = useState<string | null>(null);
  const [unfollowUser, setUnfollowUser] = useState('');
  const [unfollowMessage, setUnfollowMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      let url = '/api/leaderboard';

      if (type === 'followers') {
        const userData = localStorage.getItem('user_data');
        if (!userData) {
          setError("User not logged in.");
          return;
        }

        try {
          const parsed = JSON.parse(userData);
          if (!parsed._id) {
            setError("User ID missing.");
            return;
          }

          url = `/api/leaderboard/friends/${parsed._id}`;
        } catch (e) {
          setError("Failed to parse user data.");
          return;
        }
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) {
          setError(data?.error || "Unexpected server response.");
          setUsers([]);
          return;
        }

        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not fetch leaderboard.");
        setUsers([]);
      }
    };

    fetchLeaderboard();
  }, [type]);

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇 ';
    if (index === 1) return '🥈 ';
    if (index === 2) return '🥉 ';
    return `${index + 1}`;
  };

  const back = () => {
    window.location.href = "/Dashboard";
  };

  const handleFollow = async () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      setFollowMessage("You must be logged in to follow someone.");
      return;
    }

    const parsed = JSON.parse(userData);
    const userId = parsed._id;

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, followUser: followUser.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        setFollowMessage(result.error || "Failed to follow user.");
      } else {
        setFollowMessage("User followed!");
        setFollowUser('');
      }
    } catch (err) {
      console.error("User follow error:", err);
      setFollowMessage("Error following user.");
    }
  };

  const handleUnfollow = async () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      setUnfollowMessage("You must be logged in to unfollow someone.");
      return;
    }

    const parsed = JSON.parse(userData);
    const userId = parsed._id;
    const trimmed = unfollowUser.trim();

    if (!trimmed) {
      setUnfollowMessage("Please enter a username to unfollow.");
      return;
    }

    try {
      const response = await fetch(`/api/unfollow/${userId}/${trimmed}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        setUnfollowMessage(result.error || "Failed to unfollow user.");
      } else {
        setUnfollowMessage(`Unfollowed ${trimmed}!`);
        setUnfollowUser('');
      }
    } catch (err) {
      console.error("Unfollow user error:", err);
      setUnfollowMessage("Error unfollowing user.");
    }
  };

  const filteredUsers = users.slice(0, 20);

  return (
    <div className="leaderboard-container">
      <div className="header">
        <h2>Leaderboard</h2>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LeaderboardType)}
        >
          <option value="global">Global</option>
          <option value="followers">Followers</option>
        </select>
      </div>

      <ul className="leaderboard-list">
        {error ? (
          <li className="leaderboard-item">{error}</li>
        ) : filteredUsers.length === 0 ? (
          <li className="leaderboard-item">No users to display.</li>
        ) : (
          filteredUsers.map((user, index) => (
            <li key={user.username} className="leaderboard-item">
              <span className="rank">{getRankDisplay(index)}</span>
              <span className="username">{user.username}</span>
              <span className="xp">{user.xp} XP</span>
            </li>
          ))
        )}
      </ul>

      <div className="add-friend-form" style={{ marginTop: '2rem', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Username of follower"
          value={followUser}
          onChange={(e) => setFollowUser(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFollow()}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            width: '60%',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            boxShadow: '0 0 6px rgba(0, 0, 0, 0.2)',
            outline: 'none'
          }}
        />
        <button
          onClick={handleFollow}
          className="button"
          style={{
            whiteSpace: 'nowrap',
            background: 'linear-gradient(to right, #a855f7, #6b21a8)',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
          }}
        >
          Follow User
        </button>
      </div>

      {followMessage && (
        <p style={{ color: 'white', textAlign: 'center', marginTop: '8px' }}>
          {followMessage}
        </p>
      )}

      <div className="unfollow-friend-form" style={{ marginTop: '1rem', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Username to unfollow"
          value={unfollowUser}
          onChange={(e) => setUnfollowUser(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnfollow()}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            width: '60%',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            boxShadow: '0 0 6px rgba(0, 0, 0, 0.2)',
            outline: 'none'
          }}
        />
        <button
          onClick={handleUnfollow}
          className="button"
          style={{
            whiteSpace: 'nowrap',
            background: 'linear-gradient(to right, #f43f5e, #be123c)',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)'
          }}
        >
          Unfollow User
        </button>
      </div>

      {unfollowMessage && (
        <p style={{ color: 'white', textAlign: 'center', marginTop: '8px' }}>
          {unfollowMessage}
        </p>
      )}

      <button
        onClick={back}
        className="button"
        style={{
          marginTop: '2rem',
          background: 'linear-gradient(to right, #a855f7, #6b21a8)',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 16px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
        }}
      >
        Back
      </button>
      <br />
    </div>
  );
};

export default Leaderboard;
