import { unlockTime } from "@/models"
import { getUnlockTime } from "./time.util"

export const shouldUnlockPost = (postTimeStamp: number, unlockYears: number) => {
    const currentTimeStamp = new Date().getTime()

    const unlockYearsInTimeStamp = unlockYears * unlockTime.year

    const shouldUnlockPost = (currentTimeStamp + unlockYearsInTimeStamp) > (postTimeStamp + unlockYearsInTimeStamp)

    return shouldUnlockPost
}

export const getUnlockFormattedDays = (postTimeStamp: number, unlockYears: number) => {
    const unlockTimeStamp = postTimeStamp + (unlockYears * unlockTime.year)
    return getUnlockTime(unlockTimeStamp)
}