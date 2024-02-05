import { type BaseComponentProps } from "@/models"
import { TextFieldLabel } from "./components"

export const TextField = ({ children, ...props }: BaseComponentProps) => {
    return (
        <label {...props}>
            {children}
        </label>
    )
}

TextField.Label = TextFieldLabel