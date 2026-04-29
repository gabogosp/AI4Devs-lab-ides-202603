import React from 'react';
import { Container } from 'react-bootstrap';
import { PersonPlus } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const RecruiterDashboard: React.FC = () => (
  <Container className="py-5">
    <header className="mb-4">
      <h1 className="h3">Recruiter dashboard</h1>
      <p className="text-muted mb-0">
        Manage candidates and hiring workflows from here.
      </p>
    </header>
    <Link
      to="/candidates/new"
      className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
    >
      <PersonPlus aria-hidden />
      Add candidate
    </Link>
  </Container>
);

export default RecruiterDashboard;
