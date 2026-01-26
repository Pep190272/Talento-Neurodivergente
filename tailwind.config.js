/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    GOLD: '#046BD2', // Override gold to blue as per existing CSS variable usage
                    PURPLE: '#046BD2',
                }
            }
        },
    },
    plugins: [],
}
