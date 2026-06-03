import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {FileInput} from './FileInput';

describe('FileInput', () => {
  it('calls onChange when a file is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});

    render(<FileInput label="Upload" onChange={onChange} value={null} />);

    await user.upload(screen.getByLabelText('Upload'), file);
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('calls onChange with File[] when isMultiple', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file1 = new File(['a'], 'a.txt', {type: 'text/plain'});
    const file2 = new File(['b'], 'b.txt', {type: 'text/plain'});

    render(
      <FileInput isMultiple label="Upload" onChange={onChange} value={[]} />,
    );

    await user.upload(screen.getByLabelText('Upload'), [file1, file2]);
    expect(onChange).toHaveBeenCalledWith([file1, file2]);
  });

  it('sets aria-invalid when status is error', () => {
    render(
      <FileInput
        label="Upload"
        onChange={() => {}}
        status={{message: 'Required', type: 'error'}}
        value={null}
      />,
    );

    expect(screen.getByLabelText('Upload')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('disables the input when isDisabled is true', () => {
    render(
      <FileInput isDisabled label="Upload" onChange={() => {}} value={null} />,
    );

    expect(screen.getByLabelText('Upload')).toBeDisabled();
  });

  it('does not process dropped files when disabled', () => {
    const onChange = vi.fn();

    render(
      <FileInput
        isDisabled
        label="Upload"
        mode="dropzone"
        onChange={onChange}
        value={null}
      />,
    );

    const dropzone = screen.getByRole('button');
    const file = new File(['data'], 'test.txt', {type: 'text/plain'});

    fireEvent.drop(dropzone, {
      dataTransfer: {files: [file]},
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays file name when value is set', () => {
    const file = new File(['data'], 'report.pdf', {type: 'application/pdf'});

    render(<FileInput label="Upload" onChange={() => {}} value={file} />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('clears the file when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File(['data'], 'report.pdf', {type: 'application/pdf'});

    render(<FileInput label="Upload" onChange={onChange} value={file} />);

    await user.click(screen.getByRole('button', {name: 'Clear Upload'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('rejects files that do not match accept filter', () => {
    const onChange = vi.fn();
    const file = new File(['data'], 'doc.pdf', {type: 'application/pdf'});

    render(
      <FileInput
        accept="image/png, image/jpeg"
        label="Upload"
        onChange={onChange}
        value={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Upload'), {
      target: {files: [file]},
    });
    expect(onChange).toHaveBeenCalledWith(null);
    expect(
      screen.getByText('One or more files are not an accepted type.'),
    ).toBeInTheDocument();
  });

  it('rejects files exceeding maxSize', () => {
    const onChange = vi.fn();
    const bigFile = new File(['x'.repeat(2000)], 'big.txt', {
      type: 'text/plain',
    });

    render(
      <FileInput
        label="Upload"
        maxSize={100}
        onChange={onChange}
        value={null}
      />,
    );

    fireEvent.change(screen.getByLabelText('Upload'), {
      target: {files: [bigFile]},
    });
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByText(/exceeds/)).toBeInTheDocument();
  });

  it('truncates to maxFiles when exceeded', () => {
    const onChange = vi.fn();
    const files = [
      new File(['a'], 'a.txt', {type: 'text/plain'}),
      new File(['b'], 'b.txt', {type: 'text/plain'}),
      new File(['c'], 'c.txt', {type: 'text/plain'}),
    ];

    render(
      <FileInput
        isMultiple
        label="Upload"
        maxFiles={2}
        onChange={onChange}
        value={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Upload'), {
      target: {files},
    });
    expect(onChange).toHaveBeenCalledWith([files[0], files[1]]);
    expect(screen.getByText('Maximum 2 files allowed.')).toBeInTheDocument();
  });
});
