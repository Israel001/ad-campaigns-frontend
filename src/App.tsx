import { Route, Routes } from 'react-router';
import { Link } from 'react-router-dom';
import Campaign from './pages/Campaigns';
import './App.css';
import CreateCampaign from './pages/CreateCampaign';

const App = () => {
  return (
    <>
      <Routes>
        <Route index element={<Campaign />} />
        <Route path="campaign/create" element={<CreateCampaign />} />
        <Route path="campaign/:id/edit" element={<CreateCampaign />} />
        <Route
          path="*"
          element={
            <span className="abs-center">
              Nothing to see here.{' '}
              <Link to="/" style={{ textDecoration: 'underline' }}>
                Go to the home page
              </Link>
            </span>
          }
        />
      </Routes>
    </>
  );
};

export default App;
