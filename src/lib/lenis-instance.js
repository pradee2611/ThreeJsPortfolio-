// Tiny mutable holder so any client component (Navbar, Footer, …) can
// trigger a smooth scroll through the single Lenis instance created in
// page.js, without wiring a React context through the whole tree.
const holder = { current: null };
export default holder;
