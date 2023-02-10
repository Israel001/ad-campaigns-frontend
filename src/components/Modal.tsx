import { IModal } from '../types';
import BootstrapModal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import { Circles } from 'react-loader-spinner';

const baseUrl = process.env.REACT_APP_SERVER_URL;

const Modal = ({ showModal, handleClose, images, loading }: IModal) => {
  return (
    <BootstrapModal show={showModal} onHide={handleClose}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Campaign Images</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {loading ? (
          <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        ) : images.length ? (
          <div className="row">
            {images.map((img, index) => {
              return (
                <div className="col-sm-4" style={{ marginTop: '20px' }}>
                  <Image
                    thumbnail
                    src={`${baseUrl}/${img}`}
                    key={index}
                    alt="Campaign Image"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <>This campaign has no images</>
        )}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default Modal;
