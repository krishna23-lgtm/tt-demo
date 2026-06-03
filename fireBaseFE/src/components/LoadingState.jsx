export default function LoadingState({ title = "Loading", message = "Please wait while we prepare the page." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
