import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import type { SearchableSelectOption } from './searchable-select';
import { cn } from './utils';

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
}

export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  className = '',
  disabled = false,
  loading = false,
  loadingMessage = 'Loading options...',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onValueChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const previewOptions = selectedOptions.slice(0, 2);
  const overflowCount = Math.max(selectedOptions.length - previewOptions.length, 0);
  const popoverWidthStyle: React.CSSProperties = {
    width: 'min(36rem, max(var(--radix-popover-trigger-width), 18rem), calc(100vw - 2rem))',
    minWidth: 'min(18rem, calc(100vw - 2rem))',
    maxWidth: 'calc(100vw - 2rem)',
  };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-11 w-full min-w-0 justify-between rounded-lg border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300"
            disabled={disabled}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {selectedOptions.length > 0 ? (
                <>
                  {previewOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="max-w-full gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      title={option.label}
                    >
                      <span className="truncate">{option.label}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="inline-flex cursor-pointer rounded-full text-slate-400 outline-none transition-colors hover:text-slate-700 focus:ring-2 focus:ring-slate-300"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => handleRemove(option.value, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(option.value, e as unknown as React.MouseEvent);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  ))}
                  {overflowCount > 0 ? (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      +{overflowCount} more
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="truncate text-sm text-slate-500">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xl shadow-slate-950/10"
          align="start"
          sideOffset={8}
          style={popoverWidthStyle}
        >
          <Command className="overflow-hidden rounded-xl bg-white">
            <CommandInput ref={inputRef} className="h-11 py-3 text-sm" placeholder={searchPlaceholder} />
            <CommandList className="max-h-80 px-2 py-2">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-6 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingMessage}
                </div>
              ) : (
                <>
                  <CommandEmpty className="px-3 py-8 text-sm text-slate-500">{emptyMessage}</CommandEmpty>
                  <CommandGroup className="p-2 space-y-1">
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.searchText ?? `${option.label} ${option.description ?? ''}`}
                        disabled={option.disabled}
                        className="items-start gap-3 text-left"
                        keywords={option.searchText ? option.searchText.split(/\s+/).filter(Boolean) : undefined}
                        onSelect={() => {
                          if (option.disabled) {
                            return;
                          }

                          handleSelect(option.value);
                        }}
                      >
                        <Check
                          className={cn(
                            'mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-opacity',
                            value.includes(option.value) ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900" title={option.label}>
                            {option.label}
                          </div>
                          {option.description ? (
                            <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500" title={option.description}>
                              {option.description}
                            </div>
                          ) : null}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
