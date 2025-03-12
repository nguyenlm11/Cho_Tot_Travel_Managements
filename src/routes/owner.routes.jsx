import React from 'react';
import { Route } from 'react-router-dom';

// Import owner components
import OwnerHomestayList from '../pages/owner/HomestayList';
import ServiceList from '../pages/owner/ServiceList';
import CustomerList from '../pages/owner/CustomerList';
// import OwnerAddHomestay from '../pages/owner/AddHomestay';
// import OwnerHomestayDashboard from '../pages/owner/HomestayDashboard';
// import OwnerHomestayInfo from '../pages/owner/HomestayInfo';
// import OwnerRoomTypes from '../pages/owner/RoomTypes';
// import OwnerServices from '../pages/owner/Services';
// import OwnerBookings from '../pages/owner/Bookings';
// import OwnerCustomers from '../pages/owner/Customers';
// import OwnerVouchers from '../pages/owner/Vouchers';

export const ownerRoutes = [
  {
    path: "/owner/homestays",
    element: <OwnerHomestayList />,
  },
  {
    path: "/owner/homestays/add",
    element: null, // <OwnerAddHomestay />
  },
  {
    path: "/owner/homestays/:id/dashboard",
    element: null, // <OwnerHomestayDashboard />
  },
  {
    path: "/owner/homestays/:id/info",
    element: null, // <OwnerHomestayInfo />
  },
  {
    path: "/owner/homestays/:id/room-types",
    element: null, // <OwnerRoomTypes />
  },
  {
    path: "/owner/homestays/:id/services",
    element: <ServiceList />
  },
  {
    path: "/owner/homestays/:id/bookings",
    element: null, // <OwnerBookings />
  },
  {
    path: "/owner/homestays/:id/customers",
    element: <CustomerList />
  },
  {
    path: "/owner/homestays/:id/vouchers",
    element: null, // <OwnerVouchers />
  },
];

const ownerRoutesElements = ownerRoutes.map((route) => (
  <Route key={route.path} path={route.path} element={route.element} />
));

export default ownerRoutesElements; 