import React, { useRef } from 'react';
import { Button, Form } from 'react-bootstrap';

type Props = {
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
};

const CvUploadSection: React.FC<Props> = ({ file, error, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    onChange(f ?? null);
  };

  const clear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <section className="mt-4" aria-labelledby="cv-heading">
      <h2 id="cv-heading" className="h5 mb-3">
        Resume (optional)
      </h2>
      <Form.Group controlId="cv-file">
        <Form.Label>CV file (PDF or DOCX, max 10 MB)</Form.Label>
        <Form.Control
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFile}
          isInvalid={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'cv-feedback' : undefined}
        />
        <Form.Control.Feedback id="cv-feedback" type="invalid">
          {error}
        </Form.Control.Feedback>
        {file && (
          <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
            <span className="small text-muted">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </span>
            <Button type="button" variant="outline-secondary" size="sm" onClick={clear}>
              Remove file
            </Button>
          </div>
        )}
      </Form.Group>
    </section>
  );
};

export default CvUploadSection;
