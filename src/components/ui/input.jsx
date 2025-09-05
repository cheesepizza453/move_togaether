import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, label, maxLength, allowSpecialChar = true, isRequired, type = "text", ...props }, ref) => {
    const [value, setValue] = React.useState("")
    const handleChange = (e) => {
        let newValue = e.target.value

        // 특수문자 제한 처리
        if (!allowSpecialChar) {
            newValue = newValue.replace(/[^a-zA-Z0-9ㄱ-ㅎ가-힣\s]/g, "")
        }

        setValue(newValue)
    }

    return (
        <div className="relative">
            {label && (
                <label className="block text-16-m mb-[12px]">
                    {label}
                    {isRequired && <span className="text-[#E17364]">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={handleChange}
                maxLength={maxLength}
                className={cn(
                    "flex h-[54px] w-full rounded-[15px] blur:text-text-800 border border-input bg-transparent px-[18px] text-16-r transition-colors file:border-0 file:bg-transparent file:text-10-r file:text-foreground placeholder:text-muted-foreground focus:ring-brand-main focus:outline-none focus:bg-brand-sub focus:text-brand-yellow-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {maxLength &&
                <div className="absolute bottom-[-20px] right-[8px] text-12-l text-[#8B8B8B]">
                    {value.length}/{maxLength}
                </div>
            }
        </div>
    )
})
Input.displayName = "Input"

export {Input}
