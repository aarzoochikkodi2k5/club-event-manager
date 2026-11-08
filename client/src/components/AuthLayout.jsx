export default function AuthLayout({ children }) {
  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-box">{children}</div>
      </div>

      <div className="login-right">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />

        <div className="login-right-content">
          <div className="mock-stack">
            <div className="mock-card mock-back">
              <div className="mock-poster alt" style={{ height: 150 }} />
            </div>
            <div className="mock-card mock-front">
              <div className="mock-poster" />
              <div className="mock-body">
                <span className="mock-tag">Tech Club</span>
                <b>Hack Night</b>
                <small>13 Nov &middot; Seminar Hall</small>
                <div className="mock-bar"><span style={{ width: '72%' }} /></div>
                <small>29 / 40 seats taken</small>
              </div>
            </div>
          </div>

          <h2>Your campus, all in one place</h2>
          <p>Discover club events, reserve your seat, and never miss what's happening.</p>
          <div className="pills">
            <span>Live seat counts</span>
            <span>One-click RSVP</span>
            <span>Attendance tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}