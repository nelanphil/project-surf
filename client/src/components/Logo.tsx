interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export function Logo({ className = "", variant = "dark" }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#1e293b";

  return (
    <svg
      viewBox="0 0 120 30"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="20"
        fill={textColor}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="600"
        letterSpacing="0.5"
      >
        GRINGO SURF
      </text>
    </svg>
  );
}