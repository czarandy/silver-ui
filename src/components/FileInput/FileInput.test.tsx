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

    const file = new File(['data'], 'test.txt', {type: 'text/plain'});

    // The drop handler lives on the surface; firing on the input bubbles to it.
    fireEvent.drop(screen.getByLabelText('Upload'), {
      dataTransfer: {files: [file]},
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('processes dropped files in a dropzone', () => {
    const onChange = vi.fn();
    const file = new File(['data'], 'test.txt', {type: 'text/plain'});

    render(
      <FileInput
        label="Upload"
        mode="dropzone"
        onChange={onChange}
        value={null}
      />,
    );

    // The drop handler lives on the surface; firing on the input bubbles to it.
    fireEvent.drop(screen.getByLabelText('Upload'), {
      dataTransfer: {files: [file]},
    });

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('validates dropped files against the accept filter', () => {
    const onChange = vi.fn();
    const file = new File(['data'], 'doc.pdf', {type: 'application/pdf'});

    render(
      <FileInput
        accept="image/png"
        label="Upload"
        mode="dropzone"
        onChange={onChange}
        value={null}
      />,
    );

    fireEvent.drop(screen.getByLabelText('Upload'), {
      dataTransfer: {files: [file]},
    });

    expect(onChange).toHaveBeenCalledWith(null);
    expect(
      screen.getByText('One or more files are not an accepted type.'),
    ).toBeInTheDocument();
  });

  it('exposes the file input as the only interactive control', () => {
    render(
      <FileInput
        description="Max 5MB"
        label="Upload"
        onChange={() => {}}
        value={null}
      />,
    );

    // The surface wrapper is presentational, so the file input is the single
    // labeled control and there is no stray unnamed button.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // The description is wired only to the input (the single control), so it
    // isn't announced twice.
    const input = screen.getByLabelText('Upload');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Max 5MB')).toHaveAttribute('id', describedBy);
  });

  it('exposes a single tab stop for the control', async () => {
    const user = userEvent.setup();

    render(<FileInput label="Upload" onChange={() => {}} value={null} />);

    const input = screen.getByLabelText('Upload');
    // Only the file input is focusable; the presentational surface has no
    // tabIndex, so there is no second tab stop for one logical control.
    await user.tab();
    expect(input).toHaveFocus();

    await user.tab();
    expect(input).not.toHaveFocus();
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

  it('hides the clear button while loading', () => {
    const file = new File(['data'], 'report.pdf', {type: 'application/pdf'});

    render(
      <FileInput isLoading label="Upload" onChange={() => {}} value={file} />,
    );

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Clear Upload'}),
    ).not.toBeInTheDocument();
  });

  it('hides the clear button when disabled', () => {
    const file = new File(['data'], 'report.pdf', {type: 'application/pdf'});

    render(
      <FileInput isDisabled label="Upload" onChange={() => {}} value={file} />,
    );

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Clear Upload'}),
    ).not.toBeInTheDocument();
  });

  it('forwards ref to the file input element', () => {
    let inputEl: HTMLInputElement | null = null;

    render(
      <FileInput
        label="Upload"
        onChange={() => {}}
        ref={node => {
          inputEl = node;
        }}
        value={null}
      />,
    );

    expect(inputEl).toBe(screen.getByLabelText('Upload'));
    expect(inputEl).toBeInstanceOf(HTMLInputElement);
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

  it('surfaces a file validation error over an external status', () => {
    const onChange = vi.fn();
    const bigFile = new File(['x'.repeat(2000)], 'big.txt', {
      type: 'text/plain',
    });

    render(
      <FileInput
        label="Upload"
        maxSize={100}
        onChange={onChange}
        status={{message: 'File is required', type: 'error'}}
        value={null}
      />,
    );

    // The external status shows until the user acts.
    expect(screen.getByText('File is required')).toBeInTheDocument();

    // Selecting an invalid file replaces it with the immediate, actionable
    // validation feedback rather than swallowing it.
    fireEvent.change(screen.getByLabelText('Upload'), {
      target: {files: [bigFile]},
    });
    expect(screen.getByText(/exceeds/)).toBeInTheDocument();
    expect(screen.queryByText('File is required')).not.toBeInTheDocument();
  });

  it('restores the external status after a validation error is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File(['data'], 'report.pdf', {type: 'application/pdf'});
    const bigFile = new File(['x'.repeat(2000)], 'big.txt', {
      type: 'text/plain',
    });

    render(
      <FileInput
        label="Upload"
        maxSize={100}
        onChange={onChange}
        status={{message: 'File is required', type: 'error'}}
        value={file}
      />,
    );

    fireEvent.change(screen.getByLabelText('Upload'), {
      target: {files: [bigFile]},
    });
    expect(screen.getByText(/exceeds/)).toBeInTheDocument();
    expect(screen.queryByText('File is required')).not.toBeInTheDocument();

    // Clearing discards the now-stale validation error, so the consumer's
    // status surfaces again.
    await user.click(screen.getByRole('button', {name: 'Clear Upload'}));
    expect(screen.queryByText(/exceeds/)).not.toBeInTheDocument();
    expect(screen.getByText('File is required')).toBeInTheDocument();
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
