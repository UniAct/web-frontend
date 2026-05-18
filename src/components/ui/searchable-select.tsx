import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
  group?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  renderOption?: (option: SearchableSelectOption, state: { selected: boolean }) => React.ReactNode;
  renderValue?: (option?: SearchableSelectOption) => React.ReactNode;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  className = '',
  triggerClassName,
  contentClassName,
  disabled = false
  ,
  loading = false,
  loadingMessage = 'Loading options...',
  renderOption,
  renderValue,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      // focus the command input when popover opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const groupedOptions = React.useMemo(() => {
    const groups = new Map<string, SearchableSelectOption[]>();
    const ungrouped: SearchableSelectOption[] = [];

    for (const option of options) {
      if (option.group) {
        const bucket = groups.get(option.group) ?? [];
        bucket.push(option);
        groups.set(option.group, bucket);
      } else {
        ungrouped.push(option);
      }
    }

    return {
      ungrouped,
      groups: Array.from(groups.entries()),
    };
  }, [options]);

  const selectedLabel = selectedOption?.label ?? placeholder;
  const renderSelectedValue = renderValue
    ? renderValue(selectedOption)
    : (
      <span
        className={cn(
          'block min-w-0 flex-1 truncate text-sm',
          selectedOption ? 'text-slate-900' : 'text-slate-500',
        )}
        title={selectedOption ? [selectedOption.label, selectedOption.description].filter(Boolean).join(' - ') : undefined}
      >
        {selectedLabel}
      </span>
    );

  const popoverWidthStyle: React.CSSProperties = {
    width: 'min(36rem, max(var(--radix-popover-trigger-width), 18rem), calc(100vw - 2rem))',
    minWidth: 'min(18rem, calc(100vw - 2rem))',
    maxWidth: 'calc(100vw - 2rem)',
  };

  const renderDefaultOption = (option: SearchableSelectOption, selected: boolean) => (
    <>
      <Check
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-opacity',
          selected ? 'opacity-100' : 'opacity-0',
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
    </>
  );

  const renderItems = (items: SearchableSelectOption[]) =>
    items.map((option) => {
      const selected = value === option.value;

      return (
        <CommandItem
          key={option.value}
          value={option.searchText ?? `${option.label} ${option.description ?? ''}`}
          disabled={option.disabled}
          className="items-start gap-3 rounded-lg px-3 py-2.5 text-left data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-950"
          keywords={option.searchText ? option.searchText.split(/\s+/).filter(Boolean) : undefined}
          onSelect={() => {
            if (option.disabled) {
              return;
            }

            onValueChange(option.value);
            setOpen(false);
          }}
        >
          {renderOption ? renderOption(option, { selected }) : renderDefaultOption(option, selected)}
        </CommandItem>
      );
    });

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-11 w-full min-w-0 justify-between rounded-lg border-slate-200 bg-white px-3.5 text-left shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300',
              triggerClassName,
            )}
            disabled={disabled}
          >
            <span className="min-w-0 flex-1">{renderSelectedValue}</span>
            <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xl shadow-slate-950/10',
            contentClassName,
          )}
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
                  {groupedOptions.ungrouped.length > 0 ? (
                    <CommandGroup className="p-2 space-y-1">
                      {renderItems(groupedOptions.ungrouped)}
                    </CommandGroup>
                  ) : null}
                  {groupedOptions.groups.map(([groupLabel, groupItems]) => (
                    <CommandGroup key={groupLabel} heading={groupLabel} className="p-2 space-y-1">
                      {renderItems(groupItems)}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
