import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import type { EducationRow } from '../../types/candidate';
import type { FieldErrors } from '../../utils/candidateFormValidation';

const MAX_ROWS = 3;

type Props = {
  rows: EducationRow[];
  errors: FieldErrors;
  onChange: (index: number, field: keyof EducationRow, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const EducationSection: React.FC<Props> = ({
  rows,
  errors,
  onChange,
  onAdd,
  onRemove,
}) => (
  <section className="mt-4" aria-labelledby="education-heading">
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <h2 id="education-heading" className="h5 mb-0">
        Education
      </h2>
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        onClick={onAdd}
        disabled={rows.length >= MAX_ROWS}
      >
        Add education
      </Button>
    </div>
    {errors.educations && (
      <p className="text-danger small" role="alert">
        {errors.educations}
      </p>
    )}
    {rows.length === 0 && (
      <p className="text-muted small">No education entries. Optional — add up to {MAX_ROWS}.</p>
    )}
    {rows.map((row, i) => (
      <Card key={`edu-${i}`} className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="h6">Education {i + 1}</Card.Title>
            <Button type="button" variant="outline-danger" size="sm" onClick={() => onRemove(i)}>
              Remove
            </Button>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId={`education-${i}-institution`}>
                <Form.Label>Institution *</Form.Label>
                <Form.Control
                  value={row.institution}
                  onChange={(e) => onChange(i, 'institution', e.target.value)}
                  isInvalid={Boolean(errors[`education_${i}_institution`])}
                  aria-invalid={Boolean(errors[`education_${i}_institution`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`education_${i}_institution`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`education-${i}-title`}>
                <Form.Label>Degree / title *</Form.Label>
                <Form.Control
                  value={row.title}
                  onChange={(e) => onChange(i, 'title', e.target.value)}
                  isInvalid={Boolean(errors[`education_${i}_title`])}
                  aria-invalid={Boolean(errors[`education_${i}_title`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`education_${i}_title`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`education-${i}-start`}>
                <Form.Label>Start date *</Form.Label>
                <Form.Control
                  type="date"
                  value={row.startDate}
                  onChange={(e) => onChange(i, 'startDate', e.target.value)}
                  isInvalid={Boolean(errors[`education_${i}_startDate`])}
                  aria-invalid={Boolean(errors[`education_${i}_startDate`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`education_${i}_startDate`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`education-${i}-end`}>
                <Form.Label>End date</Form.Label>
                <Form.Control
                  type="date"
                  value={row.endDate}
                  onChange={(e) => onChange(i, 'endDate', e.target.value)}
                  isInvalid={Boolean(errors[`education_${i}_endDate`])}
                  aria-invalid={Boolean(errors[`education_${i}_endDate`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`education_${i}_endDate`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))}
  </section>
);

export default EducationSection;
