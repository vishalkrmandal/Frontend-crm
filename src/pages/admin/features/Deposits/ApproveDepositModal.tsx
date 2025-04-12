// Frontend/src/components/Deposits/ApproveDepositModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

const ApproveDepositModal = ({ show, handleClose, deposit, onApproved }) => {
    const [bonus, setBonus] = useState(0);
    const [remarks, setRemarks] = useState('Congratulations');
    const [loading, setLoading] = useState(false);

    if (!deposit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`/api/deposits/${deposit._id}/approve`, {
                bonus,
                remarks
            });

            toast.success('Deposit approved successfully');
            handleClose();
            onApproved(); // Refresh the deposit list
        } catch (error) {
            console.error('Error approving deposit:', error);
            toast.error('Failed to approve deposit');
        }

        setLoading(false);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Approve Deposit</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <p>
                        You are about to approve deposit of <strong>${deposit.amount?.toFixed(2)}</strong> for
                        user <strong>{deposit.user?.name}</strong>.
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label>Bonus Amount ($)</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={bonus}
                            onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Remarks</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? 'Approving...' : 'Approve Deposit'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ApproveDepositModal;