// The admin HTML is a separate Vite entrypoint from the public site's main.tsx.
// Route here before loading the legacy admin bootstrap so /admin/sbcs gets its own UI.
const path = window.location.pathname;
const isSBCSAdmin = path === '/admin/sbcs' || path === '/admin/sbcs/';
if (isSBCSAdmin) {
  import('./sbcs-admin-entry.tsx');
} else {
  import('./admin.tsx');
}
