import React from 'react'
import { Input } from './ui/input'

export default function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ref,
    ...props
  
  }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
    ref?: React.Ref<HTMLInputElement>
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)
  
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])
  
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        onChange(value)
      }, debounce)
  
      return () => clearTimeout(timeout)
    }, [value])
  
    return (
      <Input {...props}    ref={ref} value={value} onChange={(e:any) => setValue(e.target.value)} />
    )
  }