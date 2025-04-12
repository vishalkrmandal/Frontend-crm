// Frontend/src/components/Deposits/DocumentViewerModal.jsx

import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExpand, FaCompress, FaPlus, FaMinus } from 'react-icons/fa';

const DocumentViewerModal = ({ show, handleClose, deposit }) => {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [fullScreen, setFullScreen] = useState(false);

    if (!deposit) return null;

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 10, 50));
    };

    const toggleFullScreen = () => {
        setFullScreen(!fullScreen);
    };

    const openInNewTab = () => {
        window.open(`/api/deposits/${deposit._id}/proof`, '_blank');
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size={fullScreen ? "xl" : "lg"}
            centered
            className={fullScreen ? "document-viewer-fullscreen" : ""}
        >
            <Modal.Header closeButton>
                <Modal.Title>Proof of Payment</Modal.Title>
                <div className="ms-auto me-3">
                    <Button variant="light" onClick={handleZoomOut} className="me-1">
                        <FaMinus />
                    </Button>
                    <span className="mx-2">{zoomLevel}%</span>
                    <Button variant="light" onClick={handleZoomIn} className="me-1">
                        <FaPlus />
                    </Button>
                    <Button variant="light" onClick={toggleFullScreen} className="me-1">
                        {fullScreen ? <FaCompress /> : <FaExpand />}
                    </Button>
                </div>
            </Modal.Header>
            <Modal.Body className="text-center p-0" style={{ background: '#f5f5f5', minHeight: '400px', overflow: 'auto' }}>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <img
                        src={`/api/deposits/${deposit._id}/proof`}
                        alt="Proof of Payment"
                        style={{
                            transform: `scale(${zoomLevel / 100})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.2s ease-in-out',
                            maxWidth: '100%'
                        }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={openInNewTab}>
                    Open in New Tab
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DocumentViewerModal;