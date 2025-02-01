'use client';

import { useState, useCallback, useEffect,useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simulated API call
const fetchSuggestions = async (query: string, allSuggestions: Item[]): Promise<Item[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
  return allSuggestions.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
};

interface Item {
  name: string;
  code: string;
}

interface AutoCompleteProps {
  value?: string;
  classname?:string;
  onChange?: (value: string) => void;
  allSuggestions?: Item[]; // เพิ่ม prop นี้
}

export default function Autocomplete({
  value = '',
  classname,
  onChange,
  allSuggestions = [], // กำหนดค่าเริ่มต้นเป็น array ว่าง
}: AutoCompleteProps) {
  const [query, setQuery] = useState(value);
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const allSuggestionsRef = useRef(allSuggestions);
  allSuggestionsRef.current = allSuggestions;

  const fetchSuggestionsCallback = useCallback(async (q: string) => {
      if (q.trim() === '') {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      const results = await fetchSuggestions(q, allSuggestionsRef.current);//allSuggestions); // ใช้ allSuggestions จาก props
      setSuggestions(results);
      setIsLoading(false);
      
    },
    [allSuggestions], // เพิ่ม allSuggestions ใน dependency array
  );

  useEffect(() => {
    if (value) {
      const selectedItem = allSuggestions.find((item) => item.code === value);
      if (selectedItem) {
        setQuery(selectedItem.name); // อัปเดต query ด้วย name ที่ตรงกับ code
      }
    } else {
      setQuery(''); // หาก value เป็นค่าว่าง ให้ล้าง query
    }
  }, [value, allSuggestions]); // เรียกเมื่อ value หรือ allSuggestions เปลี่ยนแปลง

  useEffect(() => {
    if (debouncedQuery && isFocused) {
      fetchSuggestionsCallback(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery,isFocused]);// fetchSuggestionsCallback, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
   // if (onChange) {
      onChange?.(newValue);
   // }
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      setQuery(suggestions[selectedIndex].name);
      onChange?.(suggestions[selectedIndex].code)
      setSuggestions([]);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (item:Item) => {
    setQuery(item.name);
    onChange?.(item.code);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setSuggestions([]);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={cn(classname,"max-w-xs")}>
     
      <div className="relative">
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={suggestions.length > 0}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isLoading && isFocused && (
        <div
          className="mt-2 p-2 bg-background border rounded-md shadow-sm absolute z-10"
          aria-live="polite"
        >
          Loading...
        </div>
      )}
      
      {suggestions.length > 0 && !isLoading && isFocused && (
        <ul
          id="suggestions-list"
          className="mt-2 bg-background border rounded-md shadow-sm absolute z-10"
          role="listbox"
        >
          {suggestions.map((item, index) => (
            <li
              key={item.code}
              className={`px-4 py-2 cursor-pointer hover:bg-muted ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSuggestionClick(item)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}