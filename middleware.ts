import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }
        
        // Protect other admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin';
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*']
};
