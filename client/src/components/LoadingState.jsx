export default function LoadingState({ message = "Loading grid data..." }) {
  return (
    <div className="state-container">
      <div className="spinner"></div>
      <span style={{ fontSize: "12px", fontWeight: 500 }}>{message}</span>
    </div>
  );
}
