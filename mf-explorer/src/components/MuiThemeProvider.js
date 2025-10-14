// // src/components/MuiThemeProvider.jsx
// "use client";

// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// // import darkTheme from '@/theme/darkTheme'; // Your external theme file

// export default function MuiThemeProvider({ children }) {
//   // 1. The theme object (containing functions) is created/used entirely within this
//   //    Client Component's scope.
//   // 2. The component itself is marked "use client".
  
//   return (
//     <ThemeProvider theme={darkTheme}>
//       {/* CssBaseline must also be used inside a Client Component */}
//       <CssBaseline />
//       {children}
//     </ThemeProvider>
//   );
// }