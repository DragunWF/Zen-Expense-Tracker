/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include paths to all components that use Tailwind
  content: ["./App.{js,jsx,ts,tsx}", "./src/views/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
