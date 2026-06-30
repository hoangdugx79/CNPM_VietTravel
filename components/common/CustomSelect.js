import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function normalizeOptions(options = []) {
  return options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: String(option), label: String(option) };
    }

    return {
      value: option.value,
      label: option.label,
      description: option.description || '',
      disabled: Boolean(option.disabled),
    };
  });
}

function getMenuPosition(triggerRect, placement = 'bottom') {
  if (!triggerRect) return null;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const resolvedPlacement = placement === 'auto'
    ? (spaceBelow < 280 && spaceAbove > spaceBelow ? 'top' : 'bottom')
    : placement;

  if (resolvedPlacement === 'top') {
    return {
      left: triggerRect.left,
      top: Math.max(12, triggerRect.top - 14),
      width: triggerRect.width,
      transform: 'translateY(-100%)',
      transformOrigin: 'bottom center',
    };
  }

  return {
    left: triggerRect.left,
    top: triggerRect.bottom + 14,
    width: triggerRect.width,
    transform: 'translateY(0)',
    transformOrigin: 'top center',
  };
}

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn',
  name,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  disabled = false,
  menuPlacement = 'bottom',
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;

    const updatePosition = () => {
      const trigger = rootRef.current?.querySelector('.custom-select-trigger');
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        zIndex: 3000,
        ...getMenuPosition(triggerRect, menuPlacement),
      });
    };

    updatePosition();

    const handlePointerDown = (event) => {
      const clickedInsideRoot = rootRef.current?.contains(event.target);
      const clickedInsideMenu = menuRef.current?.contains(event.target);

      if (!clickedInsideRoot && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, { passive: true });
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, menuPlacement]);

  const handleSelect = (nextValue) => {
    if (disabled) return;

    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });

    setOpen(false);
  };

  const menu = open && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      className={`custom-select-menu is-portal ${menuClassName}`.trim()}
      role="listbox"
      style={menuStyle || undefined}
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      {normalizedOptions.map((option) => {
        const isSelected = String(option.value) === String(value);

        return (
          <button
            key={`${name || 'select'}-${option.value}`}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={`custom-select-option ${isSelected ? 'is-selected' : ''} ${optionClassName}`.trim()}
            onClick={() => !option.disabled && handleSelect(option.value)}
            disabled={option.disabled}
          >
            <span className="custom-select-option-label">{option.label}</span>
            {option.description ? (
              <span className="custom-select-option-description">{option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div
        ref={rootRef}
        className={`custom-select ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
      >
        <button
          type="button"
          className={`custom-select-trigger ${buttonClassName}`.trim()}
          onClick={() => !disabled && setOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className={`custom-select-value ${selectedOption ? 'has-value' : ''}`}>
            {selectedOption?.label || placeholder}
          </span>
          <i className="fas fa-chevron-down custom-select-caret" aria-hidden="true" />
        </button>
      </div>
      {menu}
    </>
  );
}
