
import React from "react";

const themes = [
  { name: "Ungu", key: "purple", color: "#9b87f5" },
  { name: "Biru", key: "blue", color: "#1d4ed8" },
  { name: "Hijau", key: "green", color: "#22c55e" },
];

function setCSSVar(variable: string, value: string) {
  document.documentElement.style.setProperty(variable, value);
}

export default function ColorThemeSwitcher() {
  const [active, setActive] = React.useState(() => {
    return localStorage.getItem("theme_color") || "purple";
  });

  const handleThemeChange = (key: string) => {
    setActive(key);
    localStorage.setItem("theme_color", key);
    if (key === "purple") setCSSVar("--primary", "263 70% 75%");
    if (key === "blue") setCSSVar("--primary", "220 80% 60%");
    if (key === "green") setCSSVar("--primary", "130 60% 48%");
  };

  React.useEffect(() => {
    handleThemeChange(active);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-muted-foreground">Tema:</span>
      {themes.map((theme) => (
        <button
          key={theme.key}
          aria-label={theme.name}
          className={`h-7 w-7 rounded-full border-2 ${active === theme.key ? "border-primary" : "border-transparent"}`}
          style={{ background: theme.color }}
          onClick={() => handleThemeChange(theme.key)}
        />
      ))}
    </div>
  );
}
