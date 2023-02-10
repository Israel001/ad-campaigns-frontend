import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ProgressBar } from 'react-loader-spinner';
import Modal from '../components/Modal';
import { ICampaign } from '../types';

const baseUrl = process.env.REACT_APP_SERVER_URL;

const Campaign = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<ICampaign[]>();
  const [showModal, setShowModal] = useState(false);
  const [campaignImages, setCampaignImages] = useState<string[]>([]);
  const [campaignImageLoading, setCampaignImageLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseUrl}/campaigns`)
      .then((response) => response.json())
      .then((response) => {
        setCampaigns(response);
        setLoading(false);
      });
  }, []);

  const handlePreviewImage = (id: number) => {
    setShowModal(true);
    fetch(`${baseUrl}/campaigns/${id}/images`)
      .then((response) => response.json())
      .then((response) => {
        if (response.length) {
          setCampaignImages(
            response.map((res: { imagePath: string }) => res.imagePath),
          );
        } else {
          setCampaignImages([]);
        }
        setCampaignImageLoading(false);
      });
  };

  return (
    <div className="container">
      <Modal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        images={campaignImages}
        loading={campaignImageLoading}
      />
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-sm-3">
          <Button variant="primary">
            <a
              href={'/campaign/create'}
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Create Campaign
            </a>
          </Button>
        </div>
      </div>
      <div className="row" style={{ marginTop: '20px' }}>
        {loading ? (
          <ProgressBar
            height="80"
            width="80"
            ariaLabel="progress-bar-loading"
            wrapperStyle={{}}
            wrapperClass="progress-bar-wrapper"
            borderColor="#F4442E"
            barColor="#51E5FF"
          />
        ) : (
          campaigns?.map((campaign, index) => {
            return (
              <div
                className="col-sm-3"
                style={{ marginTop: '20px' }}
                key={index}
              >
                <Card>
                  <Card.Header>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span>{campaign.name}</span>
                      <a href={`/campaign/${campaign.id}/edit`}>Edit</a>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Card.Subtitle className="mb-2 text-muted">{`${new Date(
                      campaign.from,
                    ).toLocaleDateString()} - ${new Date(
                      campaign.to,
                    ).toLocaleDateString()}`}</Card.Subtitle>
                    <Card.Subtitle style={{ marginTop: '20px' }}>
                      Daily Budget: {`${campaign.dailyBudget}`}
                    </Card.Subtitle>
                    <Card.Title style={{ marginTop: '10px' }}>
                      Total Budget: {`${campaign.totalBudget}`}
                    </Card.Title>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="success"
                      onClick={() => handlePreviewImage(campaign.id)}
                    >
                      Preview Images
                    </Button>
                  </Card.Footer>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Campaign;
