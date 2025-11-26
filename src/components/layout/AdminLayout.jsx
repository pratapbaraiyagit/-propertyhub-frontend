import React from 'react';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import { Flex, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import AdminNavbar from '../admin/AdminNavbar'; // Adjust path

const AdminLayout = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <Flex direction="column" minH="100vh">
      <AdminNavbar />
      <Box as="main" w="99vw" maxW="100vw" px={0} mx={0} p={{ base: 2, md: 4 }} minH="100vh" overflowX="hidden">
        <Breadcrumb mb={4} fontWeight="medium" fontSize="md">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/admin/dashboard">
              Admin Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathnames.slice(1).map((name, idx) => {
            const routeTo = `/admin/${pathnames.slice(1, idx + 2).join('/')}`;
            return (
              <BreadcrumbItem key={routeTo} isCurrentPage={idx === pathnames.length - 2}>
                <BreadcrumbLink as={RouterLink} to={routeTo}>
                  {name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
        <Outlet /> {/* Child routes will render here */}
      </Box>
      {/* You could add an AdminFooter here if needed */}
    </Flex>
  );
};

export default AdminLayout;