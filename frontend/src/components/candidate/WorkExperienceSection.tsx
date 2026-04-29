import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import type { WorkExperienceRow } from '../../types/candidate';
import type { FieldErrors } from '../../utils/candidateFormValidation';

type Props = {
  rows: WorkExperienceRow[];
  errors: FieldErrors;
  onChange: (index: number, field: keyof WorkExperienceRow, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const WorkExperienceSection: React.FC<Props> = ({
  rows,
  errors,
  onChange,
  onAdd,
  onRemove,
}) => (
  <section className="mt-4" aria-labelledby="work-heading">
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <h2 id="work-heading" className="h5 mb-0">
        Work experience
      </h2>
      <Button type="button" variant="outline-primary" size="sm" onClick={onAdd}>
        Add work experience
      </Button>
    </div>
    {rows.length === 0 && (
      <p className="text-muted small">No work experience entries. Optional.</p>
    )}
    {rows.map((row, i) => (
      <Card key={`work-${i}`} className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="h6">Role {i + 1}</Card.Title>
            <Button type="button" variant="outline-danger" size="sm" onClick={() => onRemove(i)}>
              Remove
            </Button>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId={`work-${i}-company`}>
                <Form.Label>Company *</Form.Label>
                <Form.Control
                  value={row.company}
                  onChange={(e) => onChange(i, 'company', e.target.value)}
                  isInvalid={Boolean(errors[`work_${i}_company`])}
                  aria-invalid={Boolean(errors[`work_${i}_company`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`work_${i}_company`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`work-${i}-position`}>
                <Form.Label>Position *</Form.Label>
                <Form.Control
                  value={row.position}
                  onChange={(e) => onChange(i, 'position', e.target.value)}
                  isInvalid={Boolean(errors[`work_${i}_position`])}
                  aria-invalid={Boolean(errors[`work_${i}_position`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`work_${i}_position`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId={`work-${i}-description`}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={row.description}
                  onChange={(e) => onChange(i, 'description', e.target.value)}
                  isInvalid={Boolean(errors[`work_${i}_description`])}
                  aria-invalid={Boolean(errors[`work_${i}_description`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`work_${i}_description`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`work-${i}-start`}>
                <Form.Label>Start date *</Form.Label>
                <Form.Control
                  type="date"
                  value={row.startDate}
                  onChange={(e) => onChange(i, 'startDate', e.target.value)}
                  isInvalid={Boolean(errors[`work_${i}_startDate`])}
                  aria-invalid={Boolean(errors[`work_${i}_startDate`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`work_${i}_startDate`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`work-${i}-end`}>
                <Form.Label>End date</Form.Label>
                <Form.Control
                  type="date"
                  value={row.endDate}
                  onChange={(e) => onChange(i, 'endDate', e.target.value)}
                  isInvalid={Boolean(errors[`work_${i}_endDate`])}
                  aria-invalid={Boolean(errors[`work_${i}_endDate`])}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`work_${i}_endDate`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))}
  </section>
);

export default WorkExperienceSection;
