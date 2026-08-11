"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import { Check, ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  {
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    loading = false,
    disabled = false,
    required = false,
    error = "",
    className = "",
    ...props
  },
  ref,
) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef(null);

  const isDisabled = disabled || loading;

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  // =====================================================
  // Close when clicking outside
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // Select Option
  // =====================================================

  const handleSelect = (option) => {
    if (isDisabled) return;

    onChange?.({
      target: {
        name,
        value: option.value,
      },
    });

    setOpen(false);
  };

  // =====================================================
  // Keyboard
  // =====================================================

  const handleKeyDown = (event) => {
    if (isDisabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-text"
        >
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Dropdown */}
      <div className="relative">
        {/* Trigger */}
        <button
          ref={ref}
          id={name}
          type="button"
          disabled={isDisabled}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`
            flex
            h-12
            w-full
            items-center
            justify-between
            rounded-lg
            border
            bg-input-background
            px-4
            text-left
            text-sm
            outline-none
            transition

            ${
              error
                ? `
                  border-red-400
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                `
                : `
                  border-border
                  hover:border-gray
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary-light
                `
            }

            ${
              isDisabled
                ? `
                  cursor-not-allowed
                  opacity-60
                `
                : "cursor-pointer"
            }
          `}
          {...props}
        >
          {/* Selected value */}
          <span
            className={selectedOption ? "text-text capitalize" : "text-input-placeholder capitalize"}
          >
            {loading ? "Loading..." : selectedOption?.label || placeholder}
          </span>

          {/* Arrow */}
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`
              shrink-0
              text-gray-dark
              transition-transform
              duration-200
              ${open ? "rotate-180" : "rotate-0"}
            `}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Menu */}
        {open && !isDisabled && (
          <div
            className="
              absolute
              z-50
              mt-2
              max-h-64
              w-full
              overflow-y-auto
              rounded-xl
              border
              border-border
              bg-background
              p-1.5
              capitalize
              shadow-lg
              ring-1
              ring-black/5
            "
            role="listbox"
          >
            {/* Placeholder */}
            {!value && (
              <div
                className="
                  px-3
                  py-2.5
                  text-sm
                  text-text-secondary
                "
              >
                {placeholder}
              </div>
            )}

            {/* Options */}
            {options.length > 0 ? (
              options.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className={`
                      flex
                      min-h-10
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2
                      text-left
                      capitalize
                      text-sm
                      transition

                      ${
                        isSelected
                          ? `
                            bg-primary-light
                            font-medium
                            text-primary-dark
                          `
                          : `
                            text-text
                            hover:bg-surface
                          `
                      }
                    `}
                  >
                    <span className="truncate">{option.label}</span>

                    {isSelected && (
                      <Check
                        size={17}
                        strokeWidth={2.5}
                        className="ml-3 shrink-0 text-primary capitalize"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div
                className="
                  px-3
                  py-3
                  text-center
                  text-sm
                  text-text-secondary
                "
              >
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
