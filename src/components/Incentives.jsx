import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadMyReports } from '../lib/myReports';

export default function Incentives() {
  const { user } = useAuth();
  const mine = loadMyReports(user?.id);
  const points = mine.length * 10 + mine.filter((r) => r.status === 'verified').length * 20;

  return (
    <div className="card incentives-card">
      <h3 className="card__title">Why neighbours stay</h3>
      <p className="incentives-lead">
        People come back when a report is seen, a spot is useful in a storm, and the street earns credit.
      </p>
      <ul className="incentives-list">
        <li><strong>+10</strong> for each climate report you file</li>
        <li><strong>+20</strong> when a coordinator verifies it</li>
        <li><strong>Safety spots</strong> that match the hazard - clinic, police, high ground</li>
        <li><strong>Local videos</strong> for the drought or flood near you</li>
        <li><strong>Leaderboard</strong> on the community board</li>
      </ul>
      <p className="incentives-points">Your report points: <strong>{points}</strong></p>
      <Link to="/report" className="card__link">File a climate report →</Link>
    </div>
  );
}
