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

export const ownerRoutes = [
  {
    path: 'homestays',
    element: <HomestayList />
  },
  {
    path: 'homestays/add',
    element: <AddHomestay />
  },
  {
    path: 'homestays/:id/dashboard',
    element: <Dashboard />
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
    path: 'homestays/:id/rentals/:rentalId/room-types/:roomTypeId/rooms',
    element: <RoomList />
  },
  {
    path: 'homestays/:id/bookings',
    element: <BookingList />
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
  }
]; 