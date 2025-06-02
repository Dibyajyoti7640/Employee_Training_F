import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
 
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
 
  return (
    <button
      onClick={() => {
        console.log("calling function");
        toggleTheme();
      }}
      className="p-2 rounded-lg transition-all focus:outline-none"
    >
      {theme === "light" ? (
        <MoonIcon className="w-6 h-6 text-gray-10" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      )}
    </button>
  );
};
 
export default ThemeToggle;