import HomestayList from '../pages/owner/HomestayList';
import AddHomestay from '../pages/owner/AddHomestay';
import HomestayDetail from '../pages/owner/HomestayDetail';
import ServiceList from '../pages/owner/ServiceList';
import CustomerList from '../pages/owner/CustomerList';
import RatingList from '../pages/owner/RatingList';
import RoomTypeDetail from '../pages/owner/RoomTypeDetail';
import Dashboard from '../pages/owner/Dashboard';
import CreateHomeStayForm from '../pages/owner/AddHomestayRental';
import HomestayRentalList from '../pages/owner/HomestayRentalList';
import HomestayRentalDetail from '../pages/owner/HomestayRentalDetail';
import RoomList from '../pages/owner/RoomList';
import AddRoomType from '../pages/owner/AddRoomType';
import { path } from 'framer-motion/client';
import { elements } from 'chart.js';
import BookingList from '../pages/owner/BookingList';
import ChatHomestay from '../pages/owner/ChatHomestay';
import EditHomestayRental from '../pages/owner/EditHomestayRental';
import EditHomestay from '../pages/owner/EditHomestay';
import EditRoomType from '../pages/owner/EditRoomType';
import { StaffList } from '../pages/owner/Manage_Staff/StaffList';
import { BookingDetail } from '../pages/owner/BookingDetail';
import ReportHomestay from '../pages/owner/ReportHomestay';

export const ownerRoutes = [
  {
    path: 'homestays',
    element: <HomestayList />
  },
  {
    path: 'staffs',
    element: <StaffList />
  },
  {
    path: 'homestays/add',
    element: <AddHomestay />
  },
  {
    path: 'homestays/:id/edit',
    element: <EditHomestay />
  },
  {
    path: 'homestays/:id/dashboard',
    element: <Dashboard />
  },
  {
    path: 'homestays/:id/reports',
    element: <ReportHomestay />
  },
  {
    path: 'homestays/:id/info',
    element: <HomestayDetail />,
  },
  {
    path: 'homestays/:id/services',
    element: <ServiceList />
  },
  {
    path: 'homestays/:id/create-homestay-rental',
    element: <CreateHomeStayForm />
  },
  {
    path: 'homestays/:id/homestay-rental',
    element: <HomestayRentalList />
  },
  {
    path: 'homestays/:id/rentals/:rentalId',
    element: <HomestayRentalDetail />
  },
  {
    path: 'homestays/:id/room-types/:roomTypeId',
    element: <RoomTypeDetail />
  },
  {
    path: 'homestays/:id/rentals/:rentalId/room-types/create',
    element: <AddRoomType />
  },
  {
    path: 'homestays/:id/rentals/:rentalId/room-types/:roomTypeId/edit',
    element: <EditRoomType />
  },
  {
    path: 'homestays/:id/rentals/:rentalId/room-types/:roomTypeId/rooms',
    element: <RoomList />
  },
  {
    path: 'homestays/:id/bookings',
    element: <BookingList />
  },
  {
    path: 'homestays/:id/bookings/:bookingId',
    element: <BookingDetail />
  },
  {
    path: 'homestays/:id/customers',
    element: <CustomerList />
  },
  {
    path: 'homestays/:id/chat',
    element: <ChatHomestay />
  },
  {
    path: 'homestays/:id/ratings',
    element: <RatingList />
  },
  {
    path: 'homestays/:homestayId/rentals/:rentalId/editHomestayRental',
    element: <EditHomestayRental />
  },
  {
    path: 'homestays/:homestayId/rentals/:rentalId/room-types/:roomTypeId/infor',
    element: <RoomTypeDetail />
  }
]; 