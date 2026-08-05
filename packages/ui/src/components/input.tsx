import * as React from 'react';
import { Eye, EyeOff, Clipboard, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  description?: string;
  /** Enable password show/hide toggle */
  showPasswordToggle?: boolean;
  /** Enable copy button */
  showCopyButton?: boolean;
  /** Copy success toast message */
  copySuccessMessage?: string;
  /** Enable password generator button */
  showPasswordGenerator?: boolean;
  /** Password generator length */
  passwordGeneratorLength?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      description,
      id,
      showPasswordToggle,
      showCopyButton,
      copySuccessMessage,
      showPasswordGenerator,
      passwordGeneratorLength,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const descId = inputId ? `${inputId}-desc` : undefined;

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    const handleCopy = async () => {
      const val = inputRef.current?.value || '';
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleGeneratePassword = () => {
      const length = passwordGeneratorLength || 16;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let pw = '';
      for (let i = 0; i < length; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
      const input = inputRef.current;
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(input, pw);
        else input.value = pw;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    const hasRightSlot = (isPassword && showPasswordToggle && !props.disabled && !props.readOnly) || showCopyButton;

    return (
      <div className="w-full">
        <div className="relative w-full">
          <input
            type={inputType}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              hasRightSlot && 'pr-20',
              error && 'border-destructive focus-visible:ring-destructive aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
              className
            )}
            ref={setRefs}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : descId ? descId : undefined}
            {...props}
          />
          {/* Right slot: password toggle + copy + generate */}
          {hasRightSlot && (
            <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1">
              {isPassword && showPasswordToggle && !props.disabled && !props.readOnly && showPasswordGenerator && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={handleGeneratePassword}
                  tabIndex={-1}
                  title="Generate password"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              )}
              {isPassword && showPasswordToggle && !props.disabled && !props.readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              )}
              {showCopyButton && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                  tabIndex={-1}
                  title={copied ? (copySuccessMessage || 'Copied!') : 'Copy to clipboard'}
                >
                  <Clipboard className="size-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
        {description && !error && (
          <p id={descId} className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
