// Frontend/src/components/Deposits/RejectDepositModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

const RejectDepositModal = ({ show, handleClose, deposit, onRejected }) => {
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    if (!deposit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`/api/deposits/${deposit._id}/reject`, {
                remarks
            });

            toast.success('Deposit rejected successfully');
            handleClose();
            onRejected(); // Refresh the deposit list
        } catch (error) {
            console.error('Error rejecting deposit:', error);
            toast.error('Failed to reject deposit');
        }

        setLoading(false);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Reject Deposit</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <p>
                        You are about to reject deposit of <strong>${deposit.amount?.toFixed(2)}</strong> for
                        user <strong>{deposit.user?.name}</strong>.
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label>Reason for Rejection</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            required
                            placeholder="Please provide a reason for rejection"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                        {loading ? 'Rejecting...' : 'Reject Deposit'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default RejectDepositModal;