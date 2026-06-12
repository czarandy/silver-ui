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
import {Button} from 'components/Button';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from 'components/Field/inputUtils';
import {fileInputRecipe} from 'components/FileInput/FileInput.recipe';
import {Spinner} from 'components/Spinner';
import {Text} from 'components/Text';
import {cx} from 'internal/cx';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {formatFileSize} from '../../internal/formatFileSize';
import isReactNode from '../../internal/isReactNode';
import {mergeRefs} from '../../internal/mergeRefs';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {Icon, type IconComponent} from '../Icon';

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
  // A validation error from the user's most recent selection is immediate,
  // actionable feedback about what they just tried to do (wrong type, too
  // large, too many), so it takes precedence over a consumer-provided `status`
  // such as a form-level "required". Once there is no validation error (a valid
  // selection or a cleared field), the external status surfaces again.
  const status =
    validationError == null
      ? statusFromProps
      : {type: 'error' as const, message: validationError};
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const fileNames = getFileNames(value);
  const displayText =
    fileNames ?? placeholder ?? (isMultiple ? 'Choose files' : 'Choose file');
  const isDropzone = mode === 'dropzone';
  const classes = fileInputRecipe({
    mode,
    size,
    status: status?.type,
    isDisabled,
    isDragOver,
  });

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

  const openFilePicker = () => {
    if (!isDisabled) {
      inputRef.current?.click();
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
      {/*
        The visually-hidden <input> is the real, focusable, labeled control
        (the Field label targets it via htmlFor), so it owns the accessible
        name, description, focus, and keyboard activation. The surface is only
        a presentational mouse/drop target — it intentionally has no role or
        keyboard handler, because that would create a redundant second control
        with the same name. Hence the scoped a11y disables below.
      */}
      {/* eslint-disable jsx-a11y-x/no-static-element-interactions, jsx-a11y-x/click-events-have-key-events */}
      <div
        aria-busy={isLoading || undefined}
        className={cx(classes.surface, className)}
        onClick={openFilePicker}
        style={style}
        {...dragProps}>
        <VisuallyHidden>
          <input
            accept={accept}
            aria-describedby={describedBy}
            aria-invalid={status?.type === 'error' || undefined}
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
        </VisuallyHidden>
        {isLoading ? (
          <Spinner size={isDropzone ? 'md' : 'sm'} />
        ) : (
          <span className={classes.icon}>
            <Icon icon={Upload} size={isDropzone ? 'md' : 'sm'} />
          </span>
        )}
        <Text
          as="span"
          className={classes.fileName}
          color={fileNames == null ? 'secondary' : 'primary'}>
          {isDragOver ? 'Drop files here' : displayText}
        </Text>
        {fileNames != null && !isDisabled && !isLoading ? (
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
          <span className={classes.icon}>{getStatusIcon(status.type)}</span>
        ) : null}
      </div>
      {/* eslint-enable jsx-a11y-x/no-static-element-interactions, jsx-a11y-x/click-events-have-key-events */}
    </Field>
  );
}

FileInput.displayName = 'FileInput';
