import React, { useState } from "react"

type NumericControlProps = {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  unit?: string
}

export function NumericControl({
  value,
  onChange,
  label,
  min = 0,
  unit = "",
}: NumericControlProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  React.useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // Allow only numeric input (optional decimal, optional negative if min < 0)
    const regex = min < 0 ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
    if (regex.test(newValue)) {
      setInputValue(newValue)
    }
  }

  const handleInputBlur = () => {
    const numericValue = parseFloat(inputValue)
    if (Number.isNaN(numericValue) || numericValue < min) {
      setInputValue(value.toString())
    } else {
      onChange(Math.max(min, numericValue))
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          inputMode="decimal"
          onKeyDown={(e) => {
            if (["e", "E", "+"].includes(e.key)) {
              e.preventDefault()
            }
          }}
          className="text-xs w-24 text-center border border-input bg-background rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && (
          <span className="text-xs text-muted-foreground w-6">{unit}</span>
        )}
      </div>
    </div>
  )
}
