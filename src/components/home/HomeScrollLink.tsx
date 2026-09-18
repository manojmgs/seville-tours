"use client";

type HomeScrollLinkProps = {
  targetId: string;
  className?: string;
  children: React.ReactNode;
  offset?: number;
};

export function HomeScrollLink({
  targetId,
  className,
  children,
  offset = 88,
}: HomeScrollLinkProps) {
  function handleClick() {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-controls={targetId}
    >
      {children}
    </button>
  );
}