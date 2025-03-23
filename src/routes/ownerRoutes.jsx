import HomestayList from '../pages/owner/HomestayList';
import AddHomestay from '../pages/owner/AddHomestay';
import HomestayDetail from '../pages/owner/HomestayDetail';
import ServiceList from '../pages/owner/ServiceList';
import RoomTypeList from '../pages/owner/RoomTypeList';
import CustomerList from '../pages/owner/CustomerList';
import RatingList from '../pages/owner/RatingList';
import RoomTypeDetail from '../pages/owner/RoomTypeDetail';
import Dashboard from '../pages/owner/Dashboard';
import CreateHomeStayForm from '../pages/owner/AddHomestayRental';

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
    path: 'homestays/:id/room-types',
    element: <RoomTypeList />
  },
  {
    path: 'homestays/:id/room-types/:roomTypeId',
    element: <RoomTypeDetail />
  },
  {
    path: 'homestays/:id/customers',
    element: <CustomerList />
  },
  {
    path: 'homestays/:id/ratings',
    element: <RatingList />
  }
]; 