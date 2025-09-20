interface LogoProps {
    className?: string
}

export function Logo({className}: LogoProps) {
    return (
        <div className="text-2xl font-bold text-primary">
            Acme Inc.
        </div>
    )
}
