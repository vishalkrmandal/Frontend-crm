// Frontend/src/components/Deposits/DepositList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Badge, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { FaSearch, FaFilter, FaFileExport, FaEye, FaCheck, FaTimes, FaFile } from 'react-icons/fa';
import DepositDetailsModal from './DepositDetailsModal';
import ApproveDepositModal from './ApproveDepositModal';
import RejectDepositModal from './RejectDepositModal';
import DocumentViewerModal from './DocumentViewerModal';

const DepositList = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
    planType: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'transactionDate',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [planTypes, setPlanTypes] = useState([]);

  // Fetch deposits with current filters and sorting
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.planType) queryParams.append('planType', filters.planType);

      // Add sorting parameters
      queryParams.append('sortBy', sortConfig.key);
      queryParams.append('sortOrder', sortConfig.direction);

      const res = await axios.get(`/api/deposits?${queryParams.toString()}`);
      setDeposits(res.data.data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
    setLoading(false);
  };

  // Fetch payment methods for filter dropdown
  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get('/api/payment-methods');
      setPaymentMethods(res.data.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Fetch plan types for filter dropdown
  const fetchPlanTypes = async () => {
    try {
      // This might be from a different endpoint based on your API structure
      const res = await axios.get('/api/accounts/plan-types');
      setPlanTypes(res.data.data);
    } catch (error) {
      console.error('Error fetching plan types:', error);
    }
  };

  useEffect(() => {
    fetchDeposits();
    fetchPaymentMethods();
    fetchPlanTypes();
  }, [sortConfig, filters]);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    fetchDeposits();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      paymentMethod: '',
      planType: ''
    });
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      const response = await axios.post('/api/deposits/export', {
        format,
        filters
      }, {
        responseType: 'blob'
      });

      // Create file link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deposits_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
    }
  };

  // Handle view deposit details
  const handleViewDetails = async (depositId) => {
    try {
      const res = await axios.get(`/api/deposits/${depositId}`);
      setSelectedDeposit(res.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching deposit details:', error);
    }
  };

  // Handle view document
  const handleViewDocument = (deposit) => {
    setSelectedDeposit(deposit);
    setShowDocumentModal(true);
  };

  // Handle approve deposit
  const handleApproveClick = (deposit) => {
    setSelectedDeposit(deposit);
    setShowApproveModal(true);
  };

  // Handle reject deposit
  const handleRejectClick = (deposit) => {
    setSelectedDeposit(deposit);
    setShowRejectModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="deposit-list-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Deposits</h2>
        <div>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filter
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-primary" id="export-dropdown">
              <FaFileExport /> Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleExport('pdf')}>PDF</Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('excel')}>Excel</Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('docx')}>Word Doc</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {showFilters && (
        <Form className="mb-3 p-3 border rounded bg-light" onSubmit={applyFilters}>
          <Row>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  {paymentMethods.map(method => (
                    <option key={method._id} value={method._id}>
                      {method.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Plan Type</Form.Label>
                <Form.Select
                  name="planType"
                  value={filters.planType}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  {planTypes.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button type="submit" variant="primary" className="mb-3 me-2">
                <FaSearch /> Apply
              </Button>
              <Button type="button" variant="outline-secondary" className="mb-3" onClick={resetFilters}>
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>Account</th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                Amount {sortConfig.key === 'amount' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th onClick={() => handleSort('transactionDate')} style={{ cursor: 'pointer' }}>
                Date {sortConfig.key === 'transactionDate' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th onClick={() => handleSort('paymentMethod')} style={{ cursor: 'pointer' }}>
                Payment Method {sortConfig.key === 'paymentMethod' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length > 0 ? (
              deposits.map(deposit => (
                <tr key={deposit._id}>
                  <td>{deposit.user.name}</td>
                  <td>{deposit.account.accountNumber}</td>
                  <td>${deposit.amount.toFixed(2)}</td>
                  <td>{getStatusBadge(deposit.status)}</td>
                  <td>{new Date(deposit.transactionDate).toLocaleDateString()}</td>
                  <td>{deposit.paymentMethod.name}</td>
                  <td>
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => handleViewDocument(deposit)}
                    >
                      <FaFile />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-1"
                      onClick={() => handleViewDetails(deposit._id)}
                    >
                      <FaEye /> Details
                    </Button>

                    {deposit.status === 'Pending' && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleApproveClick(deposit)}
                        >
                          <FaCheck /> Approve
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRejectClick(deposit)}
                        >
                          <FaTimes /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No deposits found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      {/* Details Modal */}
      <DepositDetailsModal
        show={showDetailsModal}
        handleClose={() => setShowDetailsModal(false)}
        deposit={selectedDeposit}
      />

      {/* Approve Modal */}
      <ApproveDepositModal
        show={showApproveModal}
        handleClose={() => setShowApproveModal(false)}
        deposit={selectedDeposit}
        onApproved={fetchDeposits}
      />

      {/* Reject Modal */}
      <RejectDepositModal
        show={showRejectModal}
        handleClose={() => setShowRejectModal(false)}
        deposit={selectedDeposit}
        onRejected={fetchDeposits}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        show={showDocumentModal}
        handleClose={() => setShowDocumentModal(false)}
        deposit={selectedDeposit}
      />
    </div>
  );
};

export default DepositList;
