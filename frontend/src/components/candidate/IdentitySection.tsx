import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import type { FieldErrors } from '../../utils/candidateFormValidation';

export type IdentityFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

type Props = {
  values: IdentityFields;
  errors: FieldErrors;
  onChange: (field: keyof IdentityFields, value: string) => void;
};

const IdentitySection: React.FC<Props> = ({ values, errors, onChange }) => (
  <section aria-labelledby="identity-heading">
    <h2 id="identity-heading" className="h5 mb-3">
      Candidate details
    </h2>
    <Row className="g-3">
      <Col md={6}>
        <Form.Group controlId="firstName">
          <Form.Label>First name *</Form.Label>
          <Form.Control
            type="text"
            value={values.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            isInvalid={Boolean(errors.firstName)}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'firstName-feedback' : undefined}
            autoComplete="given-name"
          />
          <Form.Control.Feedback id="firstName-feedback" type="invalid">
            {errors.firstName}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="lastName">
          <Form.Label>Last name *</Form.Label>
          <Form.Control
            type="text"
            value={values.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            isInvalid={Boolean(errors.lastName)}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'lastName-feedback' : undefined}
            autoComplete="family-name"
          />
          <Form.Control.Feedback id="lastName-feedback" type="invalid">
            {errors.lastName}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="email">
          <Form.Label>Email *</Form.Label>
          <Form.Control
            type="email"
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            isInvalid={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-feedback' : undefined}
            autoComplete="email"
          />
          <Form.Control.Feedback id="email-feedback" type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="phone">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            isInvalid={Boolean(errors.phone)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-feedback' : undefined}
            placeholder="612345678"
            autoComplete="tel"
          />
          <Form.Text muted>Spanish mobile: 9 digits starting with 6, 7, or 9.</Form.Text>
          <Form.Control.Feedback id="phone-feedback" type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col xs={12}>
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={values.address}
            onChange={(e) => onChange('address', e.target.value)}
            isInvalid={Boolean(errors.address)}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? 'address-feedback' : undefined}
            autoComplete="street-address"
          />
          <Form.Control.Feedback id="address-feedback" type="invalid">
            {errors.address}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  </section>
);

export default IdentitySection;
