// Frontend/src/components/Deposits/DepositDetailsModal.jsx

import React from 'react';
import { Modal, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { FaFilePdf, FaEye } from 'react-icons/fa';

const DepositDetailsModal = ({ show, handleClose, deposit }) => {
    if (!deposit) return null;

    const openDocumentInNewTab = () => {
        window.open(`/api/deposits/${deposit._id}/proof`, '_blank');
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Deposit Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <h5>User Information</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Name:</strong> {deposit.user.name}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Email:</strong> {deposit.user.email}
                            </ListGroup.Item>
                            {deposit.user.phone && (
                                <ListGroup.Item>
                                    <strong>Phone:</strong> {deposit.user.phone}
                                </ListGroup.Item>
                            )}
                            {deposit.user.address && (
                                <ListGroup.Item>
                                    <strong>Address:</strong> {deposit.user.address}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <h5>Account Information</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Account Number:</strong> {deposit.account.accountNumber}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Plan Type:</strong> {deposit.account.planType}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col md={6}>
                        <h5>Payment Information</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Amount:</strong> ${deposit.amount.toFixed(2)}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Payment Method:</strong> {deposit.paymentMethod.name}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Payment Type:</strong> {deposit.paymentType}
                            </ListGroup.Item>
                            {deposit.bonus > 0 && (
                                <ListGroup.Item>
                                    <strong>Bonus:</strong> ${deposit.bonus.toFixed(2)}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <h5>Status Information</h5>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Status:</strong> {deposit.status}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Requested Date:</strong> {new Date(deposit.transactionDate).toLocaleString()}
                            </ListGroup.Item>
                            {deposit.status === 'Completed' && deposit.approvalDate && (
                                <ListGroup.Item>
                                    <strong>Approval Date:</strong> {new Date(deposit.approvalDate).toLocaleString()}
                                </ListGroup.Item>
                            )}
                            {deposit.status === 'Rejected' && deposit.rejectionDate && (
                                <ListGroup.Item>
                                    <strong>Rejection Date:</strong> {new Date(deposit.rejectionDate).toLocaleString()}
                                </ListGroup.Item>
                            )}
                            {deposit.remarks && (
                                <ListGroup.Item>
                                    <strong>Remarks:</strong> {deposit.remarks}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <h5>Proof of Payment</h5>
                        <div className="document-preview">
                            <div className="text-center mb-2">
                                <img
                                    src={`/api/deposits/${deposit._id}/proof`}
                                    alt="Proof of Payment"
                                    className="img-fluid"
                                    style={{ maxHeight: '300px' }}
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" onClick={openDocumentInNewTab}>
                                    <FaEye className="me-1" /> View Full Document
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DepositDetailsModal;