import { useState } from "react";
import styles from "./CommentSection.module.css";

const colors = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4999"];

function getColor(name) {
  let hash = 0;
  const str = String(name);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CommentSection({ comments = [], onAddComment, resolveName }) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    const text = newComment.trim();
    if (!text) return;
    onAddComment(text);
    setNewComment("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <i className="fa-solid fa-comments"></i>
        Comments ({comments.length})
      </div>

      {comments.length === 0 ? (
        <div className={styles.emptyComments}>No comments yet.</div>
      ) : (
        <div className={styles.timeline}>
          {comments.map((comment) => {
            const resolved = resolveName ? resolveName(comment.user) : null;
            const displayName = comment.userName ||
              (resolved !== comment.user ? resolved : '') ||
              'Unknown User';

            return (
              <div key={comment.id} className={styles.comment}>
                <div
                  className={styles.avatar}
                  style={{ background: getColor(displayName) }}
                >
                  {getInitials(displayName)}
                </div>
                <div className={styles.content}>
                  <div className={styles.meta}>
                    {/* <span className={styles.userName}>{displayName}</span> */}
                    <span className={styles.userName}>{comment.userName}</span>
                    <span className={styles.date}>{comment.date}</span>
                  </div>
                  <div className={styles.text}>{comment.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className={styles.addBtn}
          onClick={handleSubmit}
          disabled={!newComment.trim()}
        >
          <i className="fa-solid fa-paper-plane"></i>
          Send
        </button>
      </div>
    </div>
  );
}
