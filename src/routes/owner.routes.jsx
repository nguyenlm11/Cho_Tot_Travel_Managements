import React from 'react';
import { Route } from 'react-router-dom';
import OwnerHomestayList from '../pages/owner/HomestayList';
import ServiceList from '../pages/owner/ServiceList';
import CustomerList from '../pages/owner/CustomerList';
import HomestayDetail from '../pages/owner/HomestayDetail';
import RoomTypeList from '../pages/owner/RoomTypeList';
import RoomTypeDetail from '../pages/owner/RoomTypeDetail';
import RatingList from '../pages/owner/RatingList';


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
    element: <HomestayDetail />
  },
  {
    path: "/owner/homestays/:id/room-types",
    element: <RoomTypeList />
  },
  {
    path: '/owner/homestays/:id/room-types/:roomTypeId',
    element: <RoomTypeDetail />
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
  {
    path: "/owner/homestays/:id/ratings",
    element: <RatingList />
  },
];

const ownerRoutesElements = ownerRoutes.map((route) => (
  <Route key={route.path} path={route.path} element={route.element} />
));

export default ownerRoutesElements; 