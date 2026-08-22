"use client";

import { useId, useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getCountriesForTaxCalculator, getCountry, type Country } from "@/lib/data/countries";

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  filter?: (country: Country) => boolean;
}

const SELECT_BASE = "w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";

export function CountrySelector({
  value,
  onChange,
  ariaLabel = "Select country",
  placeholder = "Select country",
  className,
  filter,
}: CountrySelectorProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allCountries = getCountriesForTaxCalculator();
  const countries = filter ? allCountries.filter(filter) : allCountries;
  const selectedCountry = getCountry(value);

  const filtered = countries.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        if (listRef.current && !listRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
            onChange(filtered[highlightedIndex].code);
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filtered, highlightedIndex, onChange]
  );

  const handleOptionClick = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  };

  const displayValue = selectedCountry
    ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.code})`
    : placeholder;

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(SELECT_BASE, "text-left justify-between", isOpen && "border-brand-500")}
      >
        <span className="truncate">{displayValue}</span>
        <svg
          className={cn("h-4 w-4 flex-shrink-0 ml-2 text-surface-400", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-surface-200 bg-white shadow-lg dark:border-dark-border dark:bg-dark-bg">
          <div className="p-2 border-b border-surface-200 dark:border-dark-border">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search country..."
              className={cn(SELECT_BASE, "w-full")}
              aria-label="Search countries"
            />
          </div>
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={ariaLabel}
            className="py-1 max-h-[300px] overflow-auto"
          >
            {filtered.map((country, index) => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.code === value}
                aria-label={`${country.flag} ${country.name} (${country.code})`}
                onClick={() => handleOptionClick(country.code)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer transition-colors",
                  index === highlightedIndex && "bg-brand-50 dark:bg-brand-900/20",
                  country.code === value && "font-medium text-brand-600 dark:text-brand-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{country.flag} {country.name}</span>
                  <span className="text-surface-500 dark:text-dark-muted ml-2 font-mono">{country.code}</span>
                </div>
                {country.taxYearLabel && (
                  <div className="text-xs text-surface-500 dark:text-dark-muted truncate">{country.taxYearLabel}</div>
                )}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-surface-500 dark:text-dark-muted text-center">
                No countries found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}