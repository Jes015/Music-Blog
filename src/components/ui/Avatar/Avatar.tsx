import { AvatarFallback, AvatarImage, Avatar as DefaultAvatar, type AvatarFallbackProps, type AvatarImageProps, type AvatarProps as DefaultAvatarProps } from "@radix-ui/react-avatar"

interface AvatarProps extends DefaultAvatarProps {
    avatarImageProps: AvatarImageProps
    avatarFallback: AvatarFallbackProps
}

export const Avatar: React.FC<AvatarProps> = ({ avatarImageProps, avatarFallback, ...props }) => {
    return (
        <DefaultAvatar
            className="border-[0.01rem] bg-neutral-800 border-borderPrimary cursor-pointer w-9 h-9 flex items-center justify-center rounded-full overflow-hidden"
            {...props}
        >
            <AvatarImage {...avatarImageProps} />
            <AvatarFallback
                {...avatarFallback}
            />
        </DefaultAvatar>
    )
}