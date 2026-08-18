"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

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
    showCode = false,
    codePrefix = "",
    clearable = false,
    searchable = false,
    searchPlaceholder = "Search...",
    ...props
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const isDisabled = disabled || loading;

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  const getOptionLabel = (option) => {
    if (!option) return "";

    if (showCode && option.code) {
      const prefix = codePrefix ? `${codePrefix}-` : "";

      return `${prefix}${String(option.code).padStart(2, "0")} ${option.label}`;
    }

    return option.label;
  };

  const filteredOptions = searchable
    ? options.filter((option) =>
        String(getOptionLabel(option))
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open, searchable]);

  const handleOpen = () => {
    if (isDisabled) return;

    setOpen((previous) => {
      const next = !previous;

      if (!next) {
        setSearch("");
      }

      return next;
    });
  };

  const handleSelect = (option) => {
    if (isDisabled || option.disabled) return;

    onChange?.({
      target: {
        name,
        value: option.value,
      },
    });

    setOpen(false);
    setSearch("");
  };

  const handleClear = (event) => {
    event.stopPropagation();

    if (isDisabled) return;

    onChange?.({
      target: {
        name,
        value: "",
      },
    });

    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (event) => {
    if (isDisabled) return;

    if (event.key === "Enter" || event.key === " ") {
      if (searchable && open) {
        return;
      }

      event.preventDefault();
      handleOpen();
    }

    if (event.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-text mb-2 block text-sm font-medium"
        >
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={ref}
          id={name}
          name={name}
          type="button"
          disabled={isDisabled}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={!!error}
          className={`bg-input-background flex h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition outline-none ${
            error
              ? `border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100`
              : `border-border hover:border-gray focus:border-primary focus:ring-primary-light focus:ring-2`
          } ${
            isDisabled ? `cursor-not-allowed opacity-60` : "cursor-pointer"
          } `}
          {...props}
        >
          <span
            className={
              selectedOption
                ? "text-text truncate capitalize"
                : "text-input-placeholder truncate capitalize"
            }
          >
            {loading
              ? "Loading..."
              : selectedOption
                ? getOptionLabel(selectedOption)
                : placeholder}
          </span>

          <div className="ml-2 flex shrink-0 items-center gap-1">
            {clearable && selectedOption && !isDisabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleClear(event);
                  }
                }}
                className="text-gray-dark hover:bg-surface hover:text-text flex h-7 w-7 items-center justify-center rounded-md transition"
                title="Clear selection"
                aria-label="Clear selection"
              >
                <X size={16} strokeWidth={2} />
              </span>
            )}

            <ChevronDown
              size={18}
              strokeWidth={2}
              className={`text-gray-dark shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {open && !isDisabled && (
          <div
            className="border-border bg-background absolute z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-lg ring-1 ring-black/5"
            role="listbox"
          >
            {searchable && (
              <div className="border-border border-b p-2">
                <div className="relative">
                  <Search
                    size={17}
                    className="text-gray-dark pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                  />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setOpen(false);
                        setSearch("");
                      }

                      event.stopPropagation();
                    }}
                    placeholder={searchPlaceholder}
                    className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition outline-none focus:ring-2"
                  />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto p-1.5">
              {!value && !search && (
                <div className="text-text-secondary px-3 py-2.5 text-sm">
                  {placeholder}
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm capitalize transition ${
                        option.disabled
                          ? "text-gray cursor-not-allowed opacity-50"
                          : isSelected
                            ? "bg-primary-light text-primary-dark font-medium"
                            : "text-text hover:bg-surface"
                      }`}
                    >
                      <span className="truncate">{getOptionLabel(option)}</span>

                      {isSelected && (
                        <Check
                          size={17}
                          strokeWidth={2.5}
                          className="text-primary ml-3 shrink-0"
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-text-secondary px-3 py-3 text-center text-sm">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
