// The admin HTML is a separate Vite entrypoint from the public site's main.tsx.
// Route here before loading the legacy admin bootstrap so /admin/sbcs gets its own UI.
const path = window.location.pathname;
const isSBCSStaff = path === '/admin/sbcs/work' || path === '/admin/sbcs/work/';
const isSBCSAdmin = path === '/admin/sbcs' || path === '/admin/sbcs/';
if (isSBCSStaff) {
  import('./sbcs-staff-entry.tsx');
} else if (isSBCSAdmin) {
  import('./sbcs-admin-entry.tsx');
} else {
  import('./admin.tsx');
}
