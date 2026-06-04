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
import {Button} from '../Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {inputRecipe} from '../Field/inputStyles';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';
import {Text} from '../Text';

export type FileInputMode = 'dropzone' | 'input';

interface FileInputBaseProps {
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
   * Maximum file size in bytes.
   */
  maxSize?: number;
  /**
   * Display mode: inline input or drag-and-drop dropzone.
   * @default 'input'
   */
  mode?: FileInputMode;
  /**
   * Placeholder text shown when no file is selected.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the hidden file input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size of the input.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

interface FileInputSingleProps extends FileInputBaseProps {
  /**
   * Whether multiple files can be selected.
   */
  isMultiple?: false;
  /**
   * Maximum number of files allowed. Only applicable when isMultiple is true.
   */
  maxFiles?: undefined;
  /**
   * Called when the selected file changes.
   */
  onChange: (file: File | null) => void;
  /**
   * Currently selected file.
   */
  value: File | null;
}

interface FileInputMultipleProps extends FileInputBaseProps {
  /**
   * Whether multiple files can be selected.
   */
  isMultiple: true;
  /**
   * Maximum number of files allowed.
   */
  maxFiles?: number;
  /**
   * Called when the selected files change.
   */
  onChange: (files: File[]) => void;
  /**
   * Currently selected files.
   */
  value: File[];
}

export type FileInputProps = (FileInputMultipleProps | FileInputSingleProps) &
  FieldNecessity;

const styles = {
  surface: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '3',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    borderRadius: 'md',
    bg: 'bg',
    cursor: 'pointer',
    _hover: {borderColor: 'fg.muted'},
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  dropzone: css({
    minH: '32',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    textAlign: 'center',
    '& > *': {
      flex: 'none',
    },
  }),
  disabled: css({
    cursor: 'not-allowed',
    opacity: 0.55,
  }),
  active: css({
    borderColor: 'primary',
    bg: 'bg.selected',
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
  if (Array.isArray(value)) {
    return value.length === 0 ? null : value.map(file => file.name).join(', ');
  }
  return value.name;
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
  size = 'md',
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
    if (isMultiple) {
      (onChange as (files: File[]) => void)(result.files);
    } else if (result.files.length === 0) {
      (onChange as (file: File | null) => void)(null);
    } else {
      (onChange as (file: File | null) => void)(result.files[0]);
    }
  };

  const handleClear = () => {
    setValidationError(null);
    if (isMultiple) {
      (onChange as (files: File[]) => void)([]);
    } else {
      (onChange as (file: File | null) => void)(null);
    }
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
          if (!isDisabled) {
            handleFiles(Array.from(event.dataTransfer.files));
          }
        },
      }
    : {};

  const necessity = getNecessity(isOptional, isRequired);

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
          isDropzone
            ? styles.dropzone
            : inputRecipe({size, status: status?.type, isDisabled}),
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
          aria-invalid={status?.type === 'error' || undefined}
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
          <Button
            icon={X}
            isIconOnly
            label={`Clear ${label}`}
            onClick={event => {
              event.stopPropagation();
              handleClear();
            }}
            size="sm"
            variant="ghost"
          />
        ) : null}
        {status != null && !isDropzone ? (
          <span className={styles.icon}>{getStatusIcon(status.type)}</span>
        ) : null}
      </div>
    </Field>
  );
}

FileInput.displayName = 'FileInput';
