import {Upload, X} from 'lucide-react';
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {formatFileSize} from '../../internal/formatFileSize';
import {mergeRefs} from '../../internal/mergeRefs';
import {Field, type FieldNecessity, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';
import {Text} from '../Text';

export type FileInputMode = 'dropzone' | 'input';

export type FileInputProps = {
  /**
   * Comma-separated MIME types or file extensions the input accepts.
   */
  accept?: string;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the hidden file input.
   */
  'data-testid'?: string;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Whether to show a clear button when files are selected.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the input is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether multiple files can be selected.
   * @default false
   */
  isMultiple?: boolean;
  /**
   * Field label text.
   */
  label: string;
  /**
   * Icon shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Maximum number of files allowed when isMultiple is true.
   */
  maxFiles?: number;
  /**
   * Maximum file size in bytes.
   */
  maxSize?: number;
  /**
   * Display mode: inline input or drag-and-drop dropzone.
   * @default 'input'
   */
  mode?: FileInputMode;
  /**
   * Called when the selected files change.
   */
  onChange: (files: File | File[] | null) => void;
  /**
   * Placeholder text shown when no file is selected.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the hidden file input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Currently selected file(s).
   */
  value: File | File[] | null;
} & FieldNecessity;

const styles = {
  surface: css({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '3',
    py: '2',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    borderRadius: 'md',
    bg: 'bg',
    cursor: 'pointer',
    _hover: {borderColor: 'fg.muted'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  dropzone: css({
    minH: '32',
    flexDirection: 'column',
    justifyContent: 'center',
    borderStyle: 'dashed',
    textAlign: 'center',
  }),
  disabled: css({
    cursor: 'not-allowed',
    opacity: 0.55,
  }),
  active: css({
    borderColor: 'primary',
    bg: 'primary.subtle',
  }),
  hiddenInput: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
  fileName: css({
    flex: 1,
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  icon: css({
    display: 'inline-flex',
    color: 'fg.muted',
  }),
  statusIcon: css({
    display: 'inline-flex',
    color: 'fg.muted',
  }),
  clearButton: css({
    display: 'inline-flex',
    p: 0,
    borderWidth: 0,
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
  }),
} as const;

function validateFiles(
  files: File[],
  options: {
    accept?: string;
    isMultiple: boolean;
    maxFiles?: number;
    maxSize?: number;
  },
): {error: string | null; files: File[]} {
  let validFiles = files;
  if (options.accept != null) {
    const acceptedTypes = options.accept
      .split(',')
      .map(type => type.trim().toLowerCase());
    validFiles = validFiles.filter(file =>
      acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type.toLowerCase() === type;
      }),
    );
    if (validFiles.length !== files.length) {
      return {
        files: validFiles,
        error: 'One or more files are not an accepted type.',
      };
    }
  }
  if (options.maxSize != null) {
    const maxSize = options.maxSize;
    const oversized = validFiles.find(file => file.size > maxSize);
    if (oversized != null) {
      return {
        error: `"${oversized.name}" exceeds ${formatFileSize(maxSize)}.`,
        files: validFiles.filter(file => file.size <= maxSize),
      };
    }
  }
  if (
    options.isMultiple &&
    options.maxFiles != null &&
    validFiles.length > options.maxFiles
  ) {
    return {
      files: validFiles.slice(0, options.maxFiles),
      error: `Maximum ${options.maxFiles} files allowed.`,
    };
  }
  return {files: validFiles, error: null};
}

function getFileNames(value: File | File[] | null): string | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value)
    ? value.map(file => file.name).join(', ')
    : value.name;
}

/**
 * A file input supporting both inline and drag-and-drop dropzone modes.
 */
export function FileInput({
  label,
  value,
  onChange,
  accept,
  isMultiple = false,
  maxSize,
  maxFiles,
  mode = 'input',
  placeholder,
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  status: statusFromProps,
  labelIcon,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: FileInputProps): React.JSX.Element {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const status =
    statusFromProps ??
    (validationError == null
      ? undefined
      : {type: 'error' as const, message: validationError});
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const fileNames = getFileNames(value);
  const displayText =
    fileNames ?? placeholder ?? (isMultiple ? 'Choose files' : 'Choose file');
  const isDropzone = mode === 'dropzone';

  const handleFiles = (files: File[]) => {
    if (isDisabled) {
      return;
    }
    const result = validateFiles(files, {
      accept,
      isMultiple,
      maxFiles,
      maxSize,
    });
    setValidationError(result.error);
    if (result.files.length === 0) {
      onChange(null);
      return;
    }
    onChange(isMultiple ? result.files : result.files[0]);
  };

  const dragProps = isDropzone
    ? {
        onDragEnter: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          if (!isDisabled) {
            setIsDragOver(true);
          }
        },
        onDragLeave: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragOver(false);
        },
        onDragOver: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          if (!isDisabled) {
            setIsDragOver(true);
          }
        },
        onDrop: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragOver(false);
          handleFiles(Array.from(event.dataTransfer.files));
        },
      }
    : {};

  const necessity: FieldNecessity = {isOptional, isRequired};

  return (
    <Field
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }>
      <div
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        aria-disabled={isDisabled || undefined}
        className={cx(
          styles.surface,
          isDropzone ? styles.dropzone : undefined,
          isDisabled ? styles.disabled : undefined,
          isDragOver ? styles.active : undefined,
          className,
        )}
        onClick={() => {
          if (!isDisabled) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={event => {
          if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        style={style}
        tabIndex={isDisabled ? -1 : 0}
        {...dragProps}>
        <input
          accept={accept}
          aria-describedby={describedBy}
          className={styles.hiddenInput}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          multiple={isMultiple}
          onChange={event => {
            handleFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = '';
          }}
          ref={mergeRefs(ref, inputRef)}
          required={isRequired}
          type="file"
        />
        {isLoading ? (
          <Spinner size={isDropzone ? 'md' : 'sm'} />
        ) : (
          <span className={styles.icon}>
            <Icon icon={Upload} size={isDropzone ? 'md' : 'sm'} />
          </span>
        )}
        <Text
          as="span"
          className={styles.fileName}
          color={fileNames == null ? 'secondary' : 'primary'}>
          {isDragOver ? 'Drop files here' : displayText}
        </Text>
        {fileNames != null ? (
          <button
            aria-label={`Clear ${label}`}
            className={styles.clearButton}
            onClick={event => {
              event.stopPropagation();
              setValidationError(null);
              onChange(null);
            }}
            type="button">
            <Icon icon={X} size="sm" />
          </button>
        ) : null}
        {status != null && !isDropzone ? (
          <span className={styles.statusIcon}>
            {getStatusIcon(status.type)}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

FileInput.displayName = 'FileInput';
