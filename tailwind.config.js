/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["index.html", "./src/**/*.jsx"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          principalDark: "#9C92F8",
          principalLight: "#7c3aed",
          secundarDark: "#E5E5E5",
          secundarLight: "#1f2937",
        },
      },
    },
    plugins: [],
  };